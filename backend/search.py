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
            "medicare": "https://www.cms.gov/search",
            "unitedhealthcare": "https://www.uhcprovider.com/en/search-results.html",
            "cigna": "https://www.cigna.com/search",
            "aetna": "https://www.aetna.com/search",
            # Add more payers as needed
        }

    async def search_policies(self, search_term: str, payer_name: Optional[str] = None, max_results: int = 5) -> List[Dict]:
        """
        Search for relevant policy pages based on the search term
        """
        search_results = []
        
        # Create a content filter based on the search term
        content_filter = BM25ContentFilter(user_query=search_term)
        
        # Create a markdown generator with the content filter
        markdown_generator = DefaultMarkdownGenerator(content_filter=content_filter)
        
        async with AsyncWebCrawler(config=self.browser_config) as crawler:
            # Configure deep crawling with BFS strategy
            deep_crawl_config = CrawlerRunConfig(
                markdown_generator=markdown_generator,
                deep_crawl_strategy=BFSDeepCrawlStrategy(
                    max_depth=2,
                    max_pages=max_results,
                    score_threshold=0.5  # Only return highly relevant pages
                )
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
            # Add search term to URL if it's a search page
            search_url = f"{start_url}?q={search_term}" if "search" in start_url else start_url
            
            # Execute the crawl
            results = await crawler.arun(
                url=search_url,
                config=config
            )

            # Process results
            policy_results = []
            
            # Handle both single result and list of results
            if isinstance(results, list):
                # Deep crawl results are returned as a list
                crawl_results = results
            else:
                # Deep crawl results might be in an attribute
                if not results.success:
                    print(f"Failed to search {start_url}: {results.error}")
                    return []
                
                if hasattr(results, 'deep_crawl_results') and results.deep_crawl_results:
                    crawl_results = results.deep_crawl_results
                else:
                    crawl_results = [results]  # Just use the single result
            
            # Process each result
            for page in crawl_results:
                if hasattr(page, 'success') and page.success and hasattr(page, 'markdown') and page.markdown:
                    # Ensure we use exact key names matching the SearchResult model
                    current_time = datetime.now()
                    policy_results.append({
                        'url': page.url,
                        'title': self._extract_title(page),
                        'summary': self._generate_summary(page),
                        'relevance_score': page.metadata.get('score', 0.0) if hasattr(page, 'metadata') else 0.0,
                        'found_date': current_time
                    })

            return policy_results
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error searching {start_url}: {str(e)}")
            return []

    def _extract_title(self, page) -> str:
        """Extract the title from the crawled page"""
        if hasattr(page, 'markdown') and page.markdown and hasattr(page.markdown, 'title'):
            return page.markdown.title
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