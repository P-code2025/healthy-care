import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HealthInsightDetail.module.css';

interface RelatedArticle {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  image: string;
}

interface RelatedVideo {
  id: string;
  title: string;
  author: string;
  image: string;
}

const RELATED_ARTICLES: RelatedArticle[] = [
  {
    id: '1',
    category: 'Nutrition & Wellness',
    categoryColor: '#D4F4DD',
    title: '10 Hydration Tips You Should Understand',
    image: '/images/health-insights/hydration-woman.jpg'
  },
  {
    id: '2',
    category: 'Health & Wellness',
    categoryColor: '#FFE5B4',
    title: 'The Role of Water in Your Workout Routine',
    image: '/images/health-insights/stretching-flexibility.jpg'
  },
  {
    id: '3',
    category: 'Nutrition Insights',
    categoryColor: '#FFD4A3',
    title: 'How to Stay Hydrated During a Busy People',
    image: '/images/health-insights/hydration-hacks.jpg'
  }
];

const RELATED_VIDEOS: RelatedVideo[] = [
  {
    id: '1',
    title: 'How to Stay Hydrated During a Busy People',
    author: 'Dr. Sarah Collins',
    image: '/images/health-insights/hydration-hacks.jpg'
  }
];

export default function HealthInsightDetail() {
  const navigate = useNavigate();
  const [, setActiveShare] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button onClick={() => navigate('/health-insights')} className={styles.backBtn}>
            ← Health Insights
          </button>
          <span className={styles.separator}>/</span>
          <span className={styles.currentPage}>Insight Details</span>
        </div>

        {/* Article Header */}
        <div className={styles.articleHeader}>
          <div className={styles.categoryBadge}>Health & Wellness</div>
          <h1 className={styles.articleTitle}>
            The Science Behind Hydration: Why Water is Essential for Health
          </h1>
          <div className={styles.articleMeta}>
            <div className={styles.authorInfo}>
              <span className={styles.authorAvatar}>👩‍⚕️</span>
              <span className={styles.authorName}>Dr. Amelia Johnson</span>
            </div>
            <span className={styles.dot}>•</span>
            <span className={styles.publishDate}>Sept 16, 2026</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className={styles.featuredImage}>
          <img src="/images/health-insights/hydration-woman.jpg" alt="Hydration" />
        </div>

        {/* Article Content */}
        <div className={styles.articleContent}>
          <p className={styles.intro}>
            This article dives into the importance of hydration for overall well-being, exploring how water 
            impacts your health and performance. Gain insight into staying hydrated throughout the day.
          </p>

          <h2>Water is the essence of life</h2>
          <p>
            Water is the essence of life, playing a crucial role in nearly every system of the body. From maintaining cellular 
            health to ensuring optimal brain function and physical performance, water makes an impact on how your body operates.
          </p>

          <h2>Why Hydration Matters</h2>
          <p>
            Hydration is essential for many reasons. First and foremost, every cell in the body relies on water to function 
            properly. This means that everything, from digestion to muscle contraction, is supported by healthy hydration. 
            When your body is properly hydrated, your blood volume and blood pressure are regulated, allowing oxygen and 
            nutrients to be efficiently delivered to cells. On the other hand, being dehydrated can leave you feeling tired, 
            weak, and unable to concentrate. It often results in fatigue, dizziness, and dry skin, especially under physical 
            or mental stress. If not managed, this will also damage your immune system and long-term health.
          </p>

          <div className={styles.quote}>
            "Hydration isn't just about drinking enough water—it's about ensuring that your body has what it needs to 
            function at its best."<br/>
            - Dr. Amelia Johnson
          </div>

          <h2>Tips for Staying Hydrated</h2>
          <p>
            Here are some practical tips to help you keep your hydration on track:
          </p>

          <ul>
            <li>Drink water consistently throughout the day, not just when you feel thirsty.</li>
            <li>Infuse your water with natural flavors—try adding lemon, cucumber, or mint to make it more enjoyable.</li>
            <li>Set reminders on your phone to drink water at regular intervals.</li>
            <li>Eat water-rich foods like fruits and vegetables: watermelon, oranges, and cucumbers are excellent choices.</li>
            <li>Monitor the color of your urine—pale yellow is a good indicator of healthy hydration.</li>
            <li>Hydrate before, during, and after physical activity to replace fluids lost through sweat.</li>
            <li>Limit caffeine and alcohol, as they can contribute to dehydration.</li>
          </ul>

          <p>
            Remember, hydration can differ for more serious health issues like kidney stones or headaches, so it's 
            important to consider your overall water balance throughout the day.
          </p>

          <h2>Conclusion</h2>
          <p>
            Water is essential to your body's functioning—from maintaining cellular health and well-being. By understanding how 
            crucial water is, you may start taking steps in your hydrated you can transform your health's overall health and 
            well-being. By taking charge of your hydration, you may experience that you feel better and more energized.
          </p>
        </div>

        {/* Related Articles */}
        <div className={styles.relatedSection}>
          <h2 className={styles.sectionTitle}>Related Articles</h2>
          <div className={styles.relatedGrid}>
            {RELATED_ARTICLES.map(article => (
              <div key={article.id} className={styles.relatedCard}>
                <div className={styles.relatedImage}>
                  <img src={article.image} alt={article.title} />
                </div>
                <div className={styles.relatedContent}>
                  <div className={styles.categoryBadge} style={{ backgroundColor: article.categoryColor }}>
                    {article.category}
                  </div>
                  <h3 className={styles.relatedTitle}>{article.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Videos */}
        <div className={styles.relatedSection}>
          <h2 className={styles.sectionTitle}>Related Video</h2>
          <div className={styles.relatedGrid}>
            {RELATED_VIDEOS.map(video => (
              <div key={video.id} className={styles.relatedCard}>
                <div className={styles.relatedImage}>
                  <img src={video.image} alt={video.title} />
                  <div className={styles.playButton}>▶</div>
                </div>
                <div className={styles.relatedContent}>
                  <h3 className={styles.relatedTitle}>{video.title}</h3>
                  <div className={styles.videoAuthor}>{video.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Share */}
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Share</h3>
          <div className={styles.shareButtons}>
            <button className={styles.shareBtn} onClick={() => setActiveShare('link')}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V15M15 10H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className={styles.shareBtn} onClick={() => setActiveShare('bookmark')}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 3h10a2 2 0 0 1 2 2v14l-7-4-7 4V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button className={styles.shareBtn} onClick={() => setActiveShare('share')}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-10 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 0l10 0" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button className={styles.shareBtn} onClick={() => setActiveShare('twitter')}>
              𝕏
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Tags</h3>
          <div className={styles.tags}>
            <span className={styles.tag}>Hydration</span>
            <span className={styles.tag}>Wellness</span>
            <span className={styles.tag}>Health</span>
          </div>
        </div>

        {/* Related Articles Sidebar */}
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Related Articles</h3>
          <div className={styles.sidebarArticles}>
            {RELATED_ARTICLES.map(article => (
              <div key={article.id} className={styles.sidebarArticle}>
                <div className={styles.sidebarArticleImage}>
                  <img src={article.image} alt={article.title} />
                </div>
                <div>
                  <div className={styles.categoryBadge} style={{ backgroundColor: article.categoryColor }}>
                    {article.category}
                  </div>
                  <h4 className={styles.sidebarArticleTitle}>{article.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className={styles.sidebarSection}>
          <h3 className={styles.sidebarTitle}>Related Video</h3>
          <div className={styles.sidebarArticles}>
            {RELATED_VIDEOS.map(video => (
              <div key={video.id} className={styles.sidebarArticle}>
                <div className={styles.sidebarArticleImage}>
                  <img src={video.image} alt={video.title} />
                  <div className={styles.smallPlayButton}>▶</div>
                </div>
                <div>
                  <h4 className={styles.sidebarArticleTitle}>{video.title}</h4>
                  <div className={styles.videoAuthor}>{video.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
