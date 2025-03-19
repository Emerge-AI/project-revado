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
        self.downloads_path = os.path.join(Path.home(), ".crawl4ai", "policy_downloads")
        os.makedirs(self.downloads_path, exist_ok=True)
        
        # Configure browser settings
        self.browser_config = BrowserConfig(
            headless=True,
            verbose=True,
            user_data_dir=os.path.join(Path.home(), ".crawl4ai", "policy_browser_data")
        )

    async def scrape_policy(self, url: str, payer_name: str, query: Optional[str] = None) -> dict:
        """
        Scrape policy content from the given URL using crawl4ai
        """
        try:
            print(f"Starting to scrape policy: {url} for payer: {payer_name}")
            
            async with AsyncWebCrawler(
                config=self.browser_config,
                accept_downloads=True,
                downloads_path=self.downloads_path
            ) as crawler:
                # Create content filter
                content_filter = BM25ContentFilter(
                    user_query=query if query else "medical policy guidelines coverage criteria"
                )
                
                # Create markdown generator with content filter
                markdown_generator = DefaultMarkdownGenerator(content_filter=content_filter)
                
                # Configure crawler run settings
                run_config = CrawlerRunConfig(
                    markdown_generator=markdown_generator,
                    js_code=[
                        # Add any JavaScript needed to handle dynamic content
                        """
                        // Scroll to load any lazy-loaded content
                        window.scrollTo(0, document.body.scrollHeight);
                        """
                    ],
                    wait_for="networkidle"  # Wait for network to be idle instead of numeric value
                )

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