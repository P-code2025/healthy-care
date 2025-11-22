import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HealthInsightsNew.module.css';

interface Article {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  date: string;
  image: string;
  author: string;
  authorAvatar: string;
  excerpt?: string;
}

interface Video {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  date: string;
  image: string;
  author: string;
  authorAvatar: string;
}

interface Author {
  id: string;
  name: string;
  avatar: string;
  followers: string;
}

const CATEGORIES = [
  { name: 'All', color: '#D4F4DD' },
  { name: 'Nutrition & Wellness', color: '#D4F4DD' },
  { name: 'Health & Lifestyle', color: '#FFE5B4' },
  { name: 'Fitness & Nutrition', color: '#FFD4A3' },
  { name: 'Health & Wellness', color: '#D4F4DD' },
  { name: 'Mental Health & Wellness', color: '#E0F2FE' }
];

const TABS = ['Recent', 'Featured', 'Trending', 'Popular', 'Recommended'];

const TRENDING_TAGS = [
  { name: '#Hydration', category: 'Health & Wellness', posts: '12 posts' },
  { name: '#IntermittentFasting', category: 'Health & Lifestyle', posts: '12 posts' },
  { name: '#Superfoods', category: 'Nutrition & Wellness', posts: '16 posts' },
  { name: '#MindfulEating', category: 'Health & Wellness', posts: '8 posts' },
  { name: '#BalancedBites', category: 'Nutrition & Wellness', posts: '9 posts' },
  { name: '#PostWorkoutNutrition', category: 'Fitness & Nutrition', posts: '10 posts' }
];

const FEATURED_ARTICLE: Article = {
  id: '1',
  category: 'Health & Wellness',
  categoryColor: '#D4F4DD',
  title: 'The Importance of Hydration for Optimal Health',
  date: 'Sept 16, 2026',
  image: '/images/health-insights/hydration-woman.jpg',
  author: 'Dr. Amelia Johnson',
  authorAvatar: '👩‍⚕️',
  excerpt: 'Learn how proper hydration impacts your overall health, energy levels, and mental clarity, and discover tips to stay well-hydra...'
};

const POPULAR_INSIGHTS: Article[] = [
  {
    id: '2',
    category: 'Fitness & Nutrition',
    categoryColor: '#FFD4A3',
    title: 'How Nutrient Timing Affects Your Workout Performance',
    date: 'Sept 20, 2026',
    image: '/images/health-insights/nuts-nutrition.jpg',
    author: 'Coach Daniel Green',
    authorAvatar: '🏃',
    excerpt: 'Discover the science behind nutrient timing and how it can improve your workout results. Learn the best times to eat for energy, recove...'
  },
  {
    id: '3',
    category: 'Health Tips',
    categoryColor: '#FFE5B4',
    title: 'Hydration Hacks for a Busy Lifestyle',
    date: 'Sept 18, 2026',
    image: '/images/health-insights/hydration-hacks.jpg',
    author: 'Dr. Emily Stevens',
    authorAvatar: '💧',
    excerpt: 'This video shares quick and practical hydration tips that you can easily implement even with a hectic schedule. Perfect for on-the-go! #hydration'
  }
];

const RECOMMENDED_ARTICLES: Article[] = [
  {
    id: '4',
    category: 'Nutrition & Wellness',
    categoryColor: '#D4F4DD',
    title: 'Superfoods: Better Brain Function',
    date: 'Aug 30, 2026',
    image: '/images/health-insights/salad-bowl.jpg',
    author: 'Chef Michael Harris',
    authorAvatar: '👨‍🍳'
  },
  {
    id: '5',
    category: 'Health & Lifestyle',
    categoryColor: '#FFE5B4',
    title: 'The Benefits of Intermittent Fasting for Longevity',
    date: 'Aug 25, 2026',
    image: '/images/health-insights/avocado-intermittent.jpg',
    author: 'Dr. Sarah Collins',
    authorAvatar: '👩‍⚕️'
  },
  {
    id: '6',
    category: 'Fitness Tips',
    categoryColor: '#FFD4A3',
    title: 'Stretching Routines to Boost Flexibility',
    date: 'Sept 5, 2026',
    image: '/images/health-insights/stretching-flexibility.jpg',
    author: 'Coach Adam Moss',
    authorAvatar: '🤸'
  }
];

const RECOMMENDED_VIDEOS: Video[] = [
  {
    id: '7',
    category: 'Nutrition Insights',
    categoryColor: '#FFE5B4',
    title: 'Quick & Healthy Breakfast Ideas for Busy Mornings',
    date: 'Aug 28, 2026',
    image: '/images/health-insights/healthy-breakfast.jpg',
    author: 'Jane Murray',
    authorAvatar: '👩‍🍳'
  }
];

const TOP_AUTHORS: Author[] = [
  { id: '1', name: 'Chef Michael Harris', avatar: '👨‍🍳', followers: '24K Followers' },
  { id: '2', name: 'Dr. Sarah Collins', avatar: '👩‍⚕️', followers: '18K Followers' },
  { id: '3', name: 'Coach Daniel Green', avatar: '🏃', followers: '22K Followers' },
  { id: '4', name: 'Jane Murray', avatar: '👩‍🍳', followers: '15K Followers' },
  { id: '5', name: 'Dr. Emily Thompson', avatar: '💧', followers: '20K Followers' },
  { id: '6', name: 'Coach Adam Moss', avatar: '🤸', followers: '17K Followers' }
];

export default function HealthInsightsNew() {
  const [selectedTab, setSelectedTab] = useState('Recent');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleArticleClick = (articleId: string) => {
    navigate(`/health-insights/${articleId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Healthy Insights</h1>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className={styles.searchBtn}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path 
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${selectedTab === tab ? styles.active : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className={styles.categories}>
          {CATEGORIES.map(category => (
            <button
              key={category.name}
              className={`${styles.categoryBtn} ${selectedCategory === category.name ? styles.active : ''}`}
              style={{ 
                backgroundColor: selectedCategory === category.name ? category.color : 'white',
                border: `1px solid ${category.color}`
              }}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Featured Article</h2>
          <div className={styles.featuredArticle} onClick={() => handleArticleClick(FEATURED_ARTICLE.id)}>
            <div className={styles.featuredImage}>
              <img src={FEATURED_ARTICLE.image} alt={FEATURED_ARTICLE.title} />
            </div>
            <div className={styles.featuredContent}>
              <div className={styles.categoryBadge} style={{ backgroundColor: FEATURED_ARTICLE.categoryColor }}>
                {FEATURED_ARTICLE.category}
              </div>
              <div className={styles.articleDate}>{FEATURED_ARTICLE.date}</div>
              <h3 className={styles.featuredTitle}>{FEATURED_ARTICLE.title}</h3>
              <p className={styles.featuredExcerpt}>{FEATURED_ARTICLE.excerpt}</p>
              <div className={styles.authorInfo}>
                <span className={styles.authorAvatar}>{FEATURED_ARTICLE.authorAvatar}</span>
                <span className={styles.authorName}>By {FEATURED_ARTICLE.author}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Insights */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Insights</h2>
            <button className={styles.seeAllBtn}>See All</button>
          </div>
          <div className={styles.insightsGrid}>
            {POPULAR_INSIGHTS.map(insight => (
              <div key={insight.id} className={styles.insightCard} onClick={() => handleArticleClick(insight.id)}>
                <div className={styles.insightImage}>
                  <img src={insight.image} alt={insight.title} />
                </div>
                <div className={styles.insightContent}>
                  <div className={styles.insightMeta}>
                    <span className={styles.categoryBadge} style={{ backgroundColor: insight.categoryColor }}>
                      {insight.category}
                    </span>
                    <span className={styles.articleDate}>{insight.date}</span>
                  </div>
                  <h3 className={styles.insightTitle}>{insight.title}</h3>
                  {insight.excerpt && <p className={styles.insightExcerpt}>{insight.excerpt}</p>}
                  <div className={styles.authorInfo}>
                    <span className={styles.authorAvatar}>{insight.authorAvatar}</span>
                    <span className={styles.authorName}>By {insight.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Section */}
        <div className={styles.recommendedSection}>
          {/* Recommended Articles */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recommended Article</h2>
              <button className={styles.seeAllBtn}>See All</button>
            </div>
            <div className={styles.recommendedGrid}>
              {RECOMMENDED_ARTICLES.map(article => (
                <div key={article.id} className={styles.recommendedCard} onClick={() => handleArticleClick(article.id)}>
                  <div className={styles.recommendedImage}>
                    <img src={article.image} alt={article.title} />
                  </div>
                  <div className={styles.recommendedContent}>
                    <span className={styles.categoryBadge} style={{ backgroundColor: article.categoryColor }}>
                      {article.category}
                    </span>
                    <h3 className={styles.recommendedTitle}>{article.title}</h3>
                    <div className={styles.articleDate}>{article.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Videos */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recommended Video</h2>
              <button className={styles.seeAllBtn}>See All</button>
            </div>
            <div className={styles.recommendedGrid}>
              {RECOMMENDED_VIDEOS.map(video => (
                <div key={video.id} className={styles.recommendedCard}>
                  <div className={styles.recommendedImage}>
                    <img src={video.image} alt={video.title} />
                    <div className={styles.playButton}>▶</div>
                  </div>
                  <div className={styles.recommendedContent}>
                    <span className={styles.categoryBadge} style={{ backgroundColor: video.categoryColor }}>
                      {video.category}
                    </span>
                    <h3 className={styles.recommendedTitle}>{video.title}</h3>
                    <div className={styles.articleDate}>{video.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Trending Tags */}
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Trending Tags</h3>
            <button className={styles.moreBtn}>⋯</button>
          </div>
          <div className={styles.tagsGrid}>
            {TRENDING_TAGS.map(tag => (
              <div key={tag.name} className={styles.tagCard}>
                <div className={styles.tagName}>{tag.name}</div>
                <div className={styles.tagCategory}>{tag.category}</div>
                <div className={styles.tagPosts}>{tag.posts}</div>
              </div>
            ))}
          </div>
          <button className={styles.showMoreBtn}>Show More</button>
        </div>

        {/* Top Authors */}
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Top Author</h3>
            <button className={styles.moreBtn}>⋯</button>
          </div>
          <div className={styles.authorsList}>
            {TOP_AUTHORS.map(author => (
              <div key={author.id} className={styles.authorItem}>
                <div className={styles.authorAvatar}>{author.avatar}</div>
                <div className={styles.authorDetails}>
                  <div className={styles.authorName}>{author.name}</div>
                  <div className={styles.authorFollowers}>{author.followers}</div>
                </div>
              </div>
            ))}
          </div>
          <button className={styles.showMoreBtn}>Show More</button>
        </div>
      </div>
    </div>
  );
}
