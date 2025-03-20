from typing import List, Optional
import asyncio
from datetime import datetime
from pathlib import Path
import os
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.content_filter_strategy import BM25ContentFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

class PolicyScraper:
    def __init__(self):
        # Simplified browser config with only parameters known to work
        self.browser_config = BrowserConfig(
            headless=True,
            verbose=True
        )
        self.downloads_path = "./downloads"
        
        # Define payer-specific scraping configurations
        self.payer_configs = {
            "medicare": {
                "wait_for": "networkidle",
                "content_selector": "main, .content, .article-content, article",
                "exclude_selector": ".header, .footer, .nav, .menu, .sidebar, .related, .recommendation, .banner",
                "policy_terms": ["policy", "coverage", "guideline", "criteria", "determination", "medical necessity", "procedure"]
            },
            "default": {
                "wait_for": "networkidle",
                "content_selector": "main, .content, article",
                "exclude_selector": ".header, .footer, .nav, .menu, .sidebar",
                "policy_terms": ["policy", "coverage", "guideline"]
            }
        }

    async def scrape_policy(self, url: str, payer_name: str, query: Optional[str] = None) -> dict:
        """
        Scrape policy content from a given URL
        """
        try:
            print(f"Starting to scrape policy: {url} for payer: {payer_name}")
            
            # Get payer-specific configuration or use default
            payer_key = payer_name.lower()
            config = self.payer_configs.get(payer_key, self.payer_configs["default"])
            
            # Enhance query with payer-specific policy terms if query is not provided or minimal
            if not query or len(query.split()) < 3:
                policy_terms = " ".join(config["policy_terms"])
                enhanced_query = f"{query} {policy_terms}" if query else policy_terms
            else:
                enhanced_query = query
                
            print(f"Using enhanced query: {enhanced_query}")
            
            async with AsyncWebCrawler(
                config=self.browser_config,
                accept_downloads=True,
                downloads_path=self.downloads_path
            ) as crawler:
                # Create content filter
                content_filter = BM25ContentFilter(
                    user_query=enhanced_query
                )
                
                # Create markdown generator with content filter
                markdown_generator = DefaultMarkdownGenerator(content_filter=content_filter)
                
                # Configure crawler run settings with safe parameter handling
                run_config_params = {
                    "markdown_generator": markdown_generator,
                    "js_code": [
                        # Add any JavaScript needed to handle dynamic content
                        """
                        // Scroll to load any lazy-loaded content
                        function scrollPage() {
                            window.scrollTo(0, 0);
                            let totalHeight = document.body.scrollHeight;
                            let scrollStep = totalHeight / 10;
                            let currentScroll = 0;
                            
                            function scroll() {
                                if (currentScroll < totalHeight) {
                                    currentScroll += scrollStep;
                                    window.scrollTo(0, currentScroll);
                                    setTimeout(scroll, 200);
                                }
                            }
                            
                            scroll();
                        }
                        scrollPage();
                        """
                    ]
                }
                
                # Only add parameters that are known to work with crawl4ai
                # Some crawl4ai versions support these, but not all
                try:
                    # Try to add wait_for parameter, which may not be supported in all versions
                    if config["wait_for"]:
                        run_config_params["wait_for"] = config["wait_for"]
                    
                    # Note: We're not adding these parameters as they may not be supported
                    # in the current version of crawl4ai being used
                    # if "content_selector" in config and config["content_selector"]:
                    #     run_config_params["content_selector"] = config["content_selector"]
                    # 
                    # if "exclude_selector" in config and config["exclude_selector"]:
                    #     run_config_params["exclude_selector"] = config["exclude_selector"]
                except Exception as e:
                    print(f"Warning: Some configuration parameters might not be supported: {str(e)}")
                
                # Create the run configuration with validated parameters
                run_config = CrawlerRunConfig(**run_config_params)

                # Execute the crawl
                print(f"Executing crawl for URL: {url}")
                result = await crawler.arun(
                    url=url,
                    config=run_config
                )

                print(f"Crawl result for {url}: success={result.success if hasattr(result, 'success') else 'unknown'}")
                if hasattr(result, 'success') and not result.success:
                    error_message = getattr(result, 'error', str(result)) if hasattr(result, 'error') else f"Failed to scrape policy: {url}"
                    raise Exception(error_message)

                # Process the results
                markdown_content = ""
                if hasattr(result, 'markdown'):
                    print(f"Result has markdown attribute, checking for content...")
                    if hasattr(result.markdown, 'fit_markdown') and result.markdown.fit_markdown:
                        markdown_content = result.markdown.fit_markdown
                        print(f"Using fit_markdown with length: {len(markdown_content)}")
                    elif hasattr(result.markdown, 'raw_markdown'):
                        markdown_content = result.markdown.raw_markdown
                        print(f"Using raw_markdown with length: {len(markdown_content)}")
                    else:
                        print("No markdown content found in the result")
                else:
                    print("Result does not have a markdown attribute")
                
                citations = self._extract_citations(result)
                attachments = result.downloaded_files if hasattr(result, 'downloaded_files') and result.downloaded_files else []
                
                return {
                    "payer_name": payer_name,
                    "policy_content": markdown_content,
                    "source_url": url,
                    "retrieved_date": datetime.now(),
                    "citations": citations,
                    "attachments": attachments
                }
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error scraping policy {url}: {str(e)}")
            raise

    def _extract_citations(self, result) -> List[str]:
        """
        Extract citations from the crawled content
        """
        citations = []
        if hasattr(result, 'markdown') and result.markdown and hasattr(result.markdown, 'references'):
            citations = result.markdown.references
        return citations 