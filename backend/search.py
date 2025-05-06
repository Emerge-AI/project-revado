from typing import List, Dict, Optional
import asyncio
from datetime import datetime
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.content_filter_strategy import BM25ContentFilter
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

class PolicySearcher:
    def __init__(self):
        self.browser_config = BrowserConfig(
            headless=True,
            verbose=True
        )
        
        # Common payer domains and their search URLs
        self.payer_search_urls = {
            "medicare": "https://www.cms.gov/search/cms",
            "unitedhealthcare": "https://www.uhcprovider.com/en/search-results.html",
            "cigna": "https://www.cigna.com/search",
            "aetna": "https://www.aetna.com/search",
            # Add more payers as needed
        }
        
        # Define specific search query parameter names by payer
        self.payer_search_params = {
            "medicare": "keys",  # CMS uses "keys" for search terms
            "unitedhealthcare": "q",
            "cigna": "q",
            "aetna": "q",
            # Default is "q" for others
        }

    async def search_policies(self, search_term: str, payer_name: Optional[str] = None, max_results: int = 5) -> List[Dict]:
        """
        Search for relevant policy pages based on the search term
        """
        search_results = []
        
        # Create a content filter based on the search term
        # Use only supported parameters
        content_filter = BM25ContentFilter(
            user_query=search_term
            # Removed unsupported parameter: min_score=0.1
        )
        
        # Create a markdown generator with the content filter
        markdown_generator = DefaultMarkdownGenerator(content_filter=content_filter)
        
        async with AsyncWebCrawler(config=self.browser_config) as crawler:
            # Configure deep crawling with BFS strategy - make score threshold more lenient
            deep_crawl_config = CrawlerRunConfig(
                markdown_generator=markdown_generator,
                deep_crawl_strategy=BFSDeepCrawlStrategy(
                    max_depth=2,
                    max_pages=max_results,
                    score_threshold=0.1  # Lower score threshold to capture more pages
                ),
                verbose=True  # Enable verbose logging
            )

            # If payer is specified, search their specific domain
            if payer_name and payer_name.lower() in self.payer_search_urls:
                start_url = self.payer_search_urls[payer_name.lower()]
                search_results.extend(
                    await self._search_payer_domain(crawler, start_url, search_term, deep_crawl_config)
                )
            else:
                # Search across multiple payer domains
                for payer, url in self.payer_search_urls.items():
                    results = await self._search_payer_domain(crawler, url, search_term, deep_crawl_config)
                    search_results.extend(results)
                    
                    # Break if we have enough results
                    if len(search_results) >= max_results:
                        break

            # Sort results by relevance score and limit to max_results
            search_results.sort(key=lambda x: x['relevance_score'], reverse=True)
            return search_results[:max_results]

    async def _search_payer_domain(self, crawler: AsyncWebCrawler, start_url: str, search_term: str, config: CrawlerRunConfig) -> List[Dict]:
        """
        Search a specific payer's domain for relevant policies
        """
        try:
            # Determine which payer domain we're searching
            payer_name = None
            for name, url in self.payer_search_urls.items():
                if url in start_url:
                    payer_name = name
                    break
            
            print(f"Searching {payer_name} domain at {start_url}")
            
            # Format search term - replace spaces with + for URL compatibility
            formatted_search_term = search_term.replace(' ', '+')
            
            # Get the appropriate query parameter name
            if payer_name and payer_name in self.payer_search_params:
                param_name = self.payer_search_params[payer_name]
                print(f"Using payer-specific parameter '{param_name}' for {payer_name}")
            else:
                param_name = "q"  # Default
                print(f"Using default parameter 'q' for search")
            
            # Construct the search URL
            if "?" in start_url:
                # URL already has parameters
                search_url = f"{start_url}&{param_name}={formatted_search_term}"
            else:
                # URL does not have parameters yet
                search_url = f"{start_url}?{param_name}={formatted_search_term}"
            
            print(f"Final search URL: {search_url}")
            
            # Execute the crawl with error handling
            try:
                results = await crawler.arun(
                    url=search_url,
                    config=config
                )
                print(f"Successfully executed crawler for {search_url}")
            except Exception as e:
                print(f"Error executing crawler for {search_url}: {str(e)}")
                import traceback
                traceback.print_exc()
                return []

            # Process results
            policy_results = []
            
            # Handle both single result and list of results
            if isinstance(results, list):
                # Deep crawl results are returned as a list
                crawl_results = results
                print(f"Got a list of {len(crawl_results)} results from crawler")
            else:
                # Deep crawl results might be in an attribute
                if not hasattr(results, 'success') or not results.success:
                    error_msg = getattr(results, 'error', 'Unknown error') if hasattr(results, 'error') else 'Unknown error'
                    print(f"Failed to search {start_url}: {error_msg}")
                    return []
                
                if hasattr(results, 'deep_crawl_results') and results.deep_crawl_results:
                    crawl_results = results.deep_crawl_results
                    print(f"Got {len(crawl_results)} results from deep_crawl_results")
                else:
                    crawl_results = [results]  # Just use the single result
                    print(f"Using single result from crawler")
            
            # Debug: Print available attributes on the first result
            if crawl_results and len(crawl_results) > 0:
                first_result = crawl_results[0]
                print(f"First result attributes: {dir(first_result)}")
                if hasattr(first_result, 'metadata'):
                    print(f"First result metadata: {first_result.metadata}")
            else:
                print("No results from crawler")
            
            # Process each result
            for i, page in enumerate(crawl_results):
                print(f"Processing result {i+1}/{len(crawl_results)}")
                if hasattr(page, 'success') and page.success and hasattr(page, 'markdown') and page.markdown:
                    title = self._extract_title(page)
                    summary = self._generate_summary(page)
                    
                    # Get relevance score, ensuring it's a numeric value
                    relevance_score = 0.0
                    if hasattr(page, 'metadata') and isinstance(page.metadata, dict):
                        print(f"Metadata for page {i+1}: {page.metadata}")
                        if 'score' in page.metadata:
                            try:
                                relevance_score = float(page.metadata['score'])
                                print(f"Found score in metadata: {relevance_score}")
                            except (ValueError, TypeError):
                                print(f"Error converting score to float: {page.metadata['score']}")
                                relevance_score = 0.0
                        else:
                            print(f"No 'score' key in metadata. Available keys: {list(page.metadata.keys())}")
                    else:
                        print(f"Page {i+1} has no metadata attribute or it's not a dict")
                        
                    # Ensure we use exact key names matching the SearchResult model
                    current_time = datetime.now()
                    policy_results.append({
                        'url': str(page.url),
                        'title': str(title),
                        'summary': str(summary),
                        'relevance_score': relevance_score,
                        'found_date': current_time
                    })
                else:
                    print(f"Page {i+1} doesn't meet criteria: success={hasattr(page, 'success') and page.success}, has_markdown={hasattr(page, 'markdown') and page.markdown}")

            print(f"Returning {len(policy_results)} policy results")
            return policy_results
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error searching {start_url}: {str(e)}")
            return []

    def _extract_title(self, page) -> str:
        """Extract the title from the crawled page"""
        if hasattr(page, 'markdown') and page.markdown and hasattr(page.markdown, 'title'):
            # Check if title is a string or a method
            if callable(page.markdown.title):
                # If it's a method, call it to get the string value
                return page.markdown.title()
            else:
                # If it's already a string value
                return str(page.markdown.title)
        return "Untitled Policy"

    def _generate_summary(self, page) -> str:
        """Generate a brief summary of the policy content"""
        if hasattr(page, 'markdown') and page.markdown:
            if hasattr(page.markdown, 'fit_markdown') and page.markdown.fit_markdown:
                # Take first 200 characters as summary
                content = page.markdown.fit_markdown
                return content[:200] + "..." if len(content) > 200 else content
            elif hasattr(page.markdown, 'raw_markdown') and page.markdown.raw_markdown:
                content = page.markdown.raw_markdown
                return content[:200] + "..." if len(content) > 200 else content
        return "No summary available" 