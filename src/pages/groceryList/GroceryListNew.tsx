import { useState } from 'react';
import styles from './GroceryListNew.module.css';

interface GroceryItem {
  id: string;
  name: string;
  image: string;
  category: 'Grains' | 'Protein' | 'Fruits' | 'Veggies' | 'Dairy' | 'Others';
  quantity: number;
  unit: string;
  calories: number;
  cost: number;
  actual: number;
  status: 'Purchased' | 'Pending';
}

const GROCERY_ITEMS: GroceryItem[] = [
  {
    id: '1',
    name: 'Oats',
    image: '/images/grocery/oats.jpg',
    category: 'Grains',
    quantity: 500,
    unit: 'gr',
    calories: 1900,
    cost: 10.00,
    actual: 1.5,
    status: 'Purchased'
  },
  {
    id: '2',
    name: 'Almond Butter',
    image: '/images/grocery/almond-butter.jpg',
    category: 'Others',
    quantity: 1,
    unit: 'jar',
    calories: 1600,
    cost: 12.50,
    actual: 1.5,
    status: 'Pending'
  },
  {
    id: '3',
    name: 'Berries',
    image: '/images/grocery/berries.jpg',
    category: 'Fruits',
    quantity: 250,
    unit: 'gr',
    calories: 120,
    cost: 7.50,
    actual: 1.4,
    status: 'Purchased'
  },
  {
    id: '4',
    name: 'Chicken Breast',
    image: '/images/grocery/chicken.jpg',
    category: 'Protein',
    quantity: 1,
    unit: 'kg',
    calories: 1650,
    cost: 18.00,
    actual: 1.8,
    status: 'Purchased'
  },
  {
    id: '5',
    name: 'Avocado',
    image: '/images/grocery/avocado.jpg',
    category: 'Fruits',
    quantity: 3,
    unit: 'units',
    calories: 720,
    cost: 9.00,
    actual: 1.2,
    status: 'Pending'
  },
  {
    id: '6',
    name: 'Spinach',
    image: '/images/grocery/spinach.jpg',
    category: 'Veggies',
    quantity: 300,
    unit: 'gr',
    calories: 69,
    cost: 6.00,
    actual: 1.3,
    status: 'Purchased'
  },
  {
    id: '7',
    name: 'Sweet Potatoes',
    image: '/images/grocery/sweet-potatoes.jpg',
    category: 'Veggies',
    quantity: 2,
    unit: 'units',
    calories: 360,
    cost: 5.50,
    actual: 1.1,
    status: 'Pending'
  },
  {
    id: '8',
    name: 'Greek Yogurt',
    image: '/images/grocery/greek-yogurt.jpg',
    category: 'Dairy',
    quantity: 1,
    unit: 'tub',
    calories: 600,
    cost: 8.50,
    actual: 1.4,
    status: 'Purchased'
  },
  {
    id: '9',
    name: 'Quinoa',
    image: '/images/grocery/quinoa.jpg',
    category: 'Grains',
    quantity: 500,
    unit: 'gr',
    calories: 1900,
    cost: 11.00,
    actual: 1.1,
    status: 'Pending'
  },
  {
    id: '10',
    name: 'Brown Rice',
    image: '/images/grocery/brown-rice.jpg',
    category: 'Grains',
    quantity: 500,
    unit: 'gr',
    calories: 1800,
    cost: 10.00,
    actual: 1.4,
    status: 'Purchased'
  },
];

const CATEGORIES = ['All Categories', 'Grains', 'Protein', 'Fruits', 'Veggies', 'Dairy', 'Others'];

export default function GroceryListNew() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  // Calculate totals
  const totalItems = GROCERY_ITEMS.length;
  const totalSpent = GROCERY_ITEMS.reduce((sum, item) => sum + item.cost, 0);
  const totalCalories = GROCERY_ITEMS.reduce((sum, item) => sum + item.calories, 0);

  // Calculate category stats
  const categoryStats = CATEGORIES.slice(1).map(category => {
    const items = GROCERY_ITEMS.filter(item => item.category === category);
    const count = items.length;
    const percentage = Math.round((count / totalItems) * 100);
    return { category, count, percentage };
  });

  // Expense breakdown for chart
  const expenseData = categoryStats.map(stat => ({
    category: stat.category,
    amount: GROCERY_ITEMS
      .filter(item => item.category === stat.category)
      .reduce((sum, item) => sum + item.cost, 0)
  }));

  const filteredItems = GROCERY_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'Grains': '#FFE5B4',
      'Protein': '#FFB84D',
      'Fruits': '#FFE5CC',
      'Veggies': '#D4F4DD',
      'Dairy': '#E0F2FE',
      'Others': '#F3E8FF'
    };
    return colors[category] || '#E5E7EB';
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Grocery List</h1>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #D4F4DD 0%, #A7E9AF 100%)' }}>
          <div className={styles.statIcon}>🛒</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{totalItems}</div>
            <div className={styles.statLabel}>Items</div>
          </div>
          <div className={styles.statChange}>+13.8%</div>
        </div>

        <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD89B 100%)' }}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>${totalSpent.toFixed(2)}</div>
            <div className={styles.statLabel}>Spent</div>
          </div>
          <div className={styles.statChange}>+10.5%</div>
        </div>

        <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #FFD4A3 0%, #FFB84D 100%)' }}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{totalCalories.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Calories</div>
          </div>
          <div className={styles.statChange}>+10.6%</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Expense Overview */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Expense Overview</h3>
            <select className={styles.periodSelect}>
              <option>Last 6 Months</option>
              <option>Last 3 Months</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className={styles.barChart}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => {
              const height = Math.random() * 80 + 20;
              return (
                <div key={month} className={styles.barWrapper}>
                  <div 
                    className={styles.bar}
                    style={{ height: `${height}%` }}
                  >
                    <span className={styles.barValue}>${Math.floor(height * 2)}</span>
                  </div>
                  <span className={styles.barLabel}>{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Expense Breakdown</h3>
            <select className={styles.periodSelect}>
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className={styles.donutChart}>
            <svg viewBox="0 0 200 200" className={styles.donutSvg}>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#FFE5B4" strokeWidth="40"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#FFB84D" strokeWidth="40" strokeDasharray="100 340" strokeDashoffset="0"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#D4F4DD" strokeWidth="40" strokeDasharray="80 360" strokeDashoffset="-100"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#E0F2FE" strokeWidth="40" strokeDasharray="60 380" strokeDashoffset="-180"/>
              <text x="100" y="95" textAnchor="middle" fontSize="32" fontWeight="700" fill="#1a1a1a">$157</text>
              <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#6B7280">Total</text>
            </svg>
          </div>
          <div className={styles.donutLegend}>
            {expenseData.map((item, index) => {
              const colors = ['#FFE5B4', '#FFB84D', '#D4F4DD', '#E0F2FE', '#FFD4A3', '#F3E8FF'];
              const percentage = Math.round((item.amount / totalSpent) * 100);
              return (
                <div key={item.category} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: colors[index] }}></div>
                  <span className={styles.legendLabel}>{item.category}</span>
                  <span className={styles.legendValue}>${item.amount.toFixed(2)}</span>
                  <span className={styles.legendPercent}>{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grocery Category */}
      <div className={styles.categorySection}>
        <h3 className={styles.sectionTitle}>Grocery Category</h3>
        <div className={styles.categoryGrid}>
          {categoryStats.map((stat) => (
            <div key={stat.category} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                {stat.category === 'Grains' && '🌾'}
                {stat.category === 'Protein' && '🥩'}
                {stat.category === 'Fruits' && '🍎'}
                {stat.category === 'Veggies' && '🥬'}
                {stat.category === 'Dairy' && '🥛'}
                {stat.category === 'Others' && '📦'}
              </div>
              <div className={styles.categoryInfo}>
                <div className={styles.categoryName}>{stat.category}</div>
                <div className={styles.categoryCount}>{stat.count} items</div>
              </div>
              <div className={styles.categoryPercent}>{stat.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grocery List Table */}
      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h3 className={styles.sectionTitle}>Grocery List</h3>
          <div className={styles.listControls}>
            <div className={styles.searchBox}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={styles.filterBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Filter
            </button>
            <button className={styles.addButton}>
              <span>+</span> Add Item
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`${styles.categoryTab} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
          <select 
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item Name <span className={styles.sortIcon}>↕</span></th>
                <th>Category <span className={styles.sortIcon}>↕</span></th>
                <th>Qty <span className={styles.sortIcon}>↕</span></th>
                <th>Calories <span className={styles.sortIcon}>↕</span></th>
                <th>Cost <span className={styles.sortIcon}>↕</span></th>
                <th>Actual <span className={styles.sortIcon}>↕</span></th>
                <th>Status <span className={styles.sortIcon}>↕</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.itemCell}>
                      <div className={styles.itemImage}>
                        <img src={item.image} alt={item.name} />
                      </div>
                      <span className={styles.itemName}>{item.name}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={styles.categoryBadge}
                      style={{ backgroundColor: getCategoryBadgeColor(item.category) }}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className={styles.quantity}>
                    <button className={styles.qtyBtn}>-</button>
                    <span>{item.quantity}</span>
                    <button className={styles.qtyBtn}>+</button>
                    <span className={styles.unit}>{item.unit}</span>
                  </td>
                  <td className={styles.calories}>{item.calories} kcal</td>
                  <td className={styles.cost}>${item.cost.toFixed(2)}</td>
                  <td className={styles.actual}>{item.actual}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.status === 'Purchased' ? styles.purchased : styles.pending}`}>
                      {item.status === 'Purchased' && '✓ '}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing <select className={styles.perPageSelect}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select> out of 40
          </div>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>›</button>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className={styles.promoBanner}>
        <div className={styles.promoContent}>
          <div className={styles.promoVeggies}>🥬</div>
          <div className={styles.promoText}>
            <p className={styles.promoTitle}>Start your health journey</p>
            <p className={styles.promoSubtitle}>with a <strong>FREE 1-month</strong></p>
            <p className={styles.promoSubtitle}>access to Nutrigo</p>
          </div>
        </div>
        <button className={styles.claimBtn}>Claim Now!</button>
      </div>
    </div>
  );
}
