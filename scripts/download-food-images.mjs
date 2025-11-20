import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'public', 'images', 'food-diary');
const manifestPath = path.join(outputDir, 'manifest.json');
const force = process.argv.includes('--force');

const FOOD_IMAGES = [
  {
    filename: 'buddha-bowl-quinoa.jpg',
    url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/photo-of-vegetable-salad-in-bowls-1640770/',
    author: 'Ella Olsson',
    description: 'Colorful buddha bowls with chickpeas, greens, and grains',
    category: 'Lunch'
  },
  {
    filename: 'citrus-fruit-board.jpg',
    url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/assorted-sliced-fruits-in-white-ceramic-bowl-1092730/',
    author: 'Jane Trang Doan',
    description: 'Citrus fruit bowl with grapefruit, avocado, and berries',
    category: 'Snack'
  },
  {
    filename: 'mexican-salad.jpg',
    url: 'https://images.pexels.com/photos/793759/pexels-photo-793759.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/variety-of-food-on-wooden-coaster-793759/',
    author: 'Jane Trang Doan',
    description: 'Protein-rich Mexican style salad with avocado and beans',
    category: 'Lunch'
  },
  {
    filename: 'berry-smoothies.jpg',
    url: 'https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/smooties-with-berries-434295/',
    author: 'Pixabay',
    description: 'Assorted berry smoothies with chia seeds',
    category: 'Breakfast'
  },
  {
    filename: 'avocado-toast-eggs.jpg',
    url: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/pastry-and-boiled-egg-on-plate-566566/',
    author: 'Foodie Factor',
    description: 'Whole grain toast with avocado, eggs, and seeds',
    category: 'Breakfast'
  },
  {
    filename: 'dragonfruit-bowl.jpg',
    url: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/top-view-photo-of-food-dessert-1099680/',
    author: 'Jane Trang Doan',
    description: 'Smoothie bowl with dragonfruit, mango, and coconut',
    category: 'Snack'
  },
  {
    filename: 'meal-prep-trays.jpg',
    url: 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/flat-lay-photography-of-three-tray-of-foods-1640775/',
    author: 'Ella Olsson',
    description: 'Weekly meal prep trays with grains, legumes, and veggies',
    category: 'Meal Prep'
  },
  {
    filename: 'vibrant-produce-flatlay.jpg',
    url: 'https://images.pexels.com/photos/1196516/pexels-photo-1196516.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/tilt-shift-lens-photography-of-five-assorted-vegetables-1196516/',
    author: 'Anna Pou',
    description: 'Fresh produce assortment with radish, peppers, and tomatoes',
    category: 'Groceries'
  },
  {
    filename: 'fruit-breakfast-board.jpg',
    url: 'https://images.pexels.com/photos/775031/pexels-photo-775031.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/assorted-fruits-on-white-surface-775031/',
    author: 'Element5 Digital',
    description: 'Breakfast board with fruits, meats, and avocado',
    category: 'Breakfast'
  },
  {
    filename: 'market-vegetables.jpg',
    url: 'https://images.pexels.com/photos/1660027/pexels-photo-1660027.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/flat-lay-photo-of-fruits-and-vegetables-1660027/',
    author: 'Elle Hughes',
    description: 'Farmers market flat lay with leafy greens and citrus',
    category: 'Groceries'
  },
  {
    filename: 'grilled-salmon-asparagus.jpg',
    url: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/grilled-meat-dish-served-on-white-plate-361184/',
    author: 'Pixabay',
    description: 'Grilled salmon with asparagus and microgreens',
    category: 'Dinner'
  },
  {
    filename: 'rainbow-fruit-platter.jpg',
    url: 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/assorted-sliced-fruits-1128678/',
    author: 'Jane Trang Doan',
    description: 'Rainbow fruit platter with berries and tropical slices',
    category: 'Dessert'
  },
  {
    filename: 'falafel-meal-prep.jpg',
    url: 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/variety-of-dishes-1640771/',
    author: 'Ella Olsson',
    description: 'Colorful meal prep bowls with falafel and chickpeas',
    category: 'Lunch'
  },
  {
    filename: 'chia-mason-jars.jpg',
    url: 'https://images.pexels.com/photos/1640768/pexels-photo-1640768.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/six-fruit-cereals-in-clear-glass-mason-jars-on-white-surface-1640768/',
    author: 'Ella Olsson',
    description: 'Overnight oats and chia puddings in mason jars',
    category: 'Snack'
  },
  {
    filename: 'kitchen-fruit-prep.jpg',
    url: 'https://images.pexels.com/photos/1153369/pexels-photo-1153369.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/woman-slicing-gourd-1153369/',
    author: 'Mastercowley',
    description: 'Preparing fruits on a wooden island in natural light',
    category: 'Lifestyle'
  },
  {
    filename: 'farmers-market-flatlay.jpg',
    url: 'https://images.pexels.com/photos/616401/pexels-photo-616401.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/variety-of-vegetables-616401/',
    author: 'Lukas',
    description: 'Root vegetables and herbs arranged on a table',
    category: 'Groceries'
  },
  {
    filename: 'brunch-board.jpg',
    url: 'https://images.pexels.com/photos/936611/pexels-photo-936611.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/bowl-of-vegetable-salad-and-sliced-fruits-936611/',
    author: 'Jane Trang Doan',
    description: 'Grazing board with salads, fruits, and proteins',
    category: 'Brunch'
  },
  {
    filename: 'protein-rice-bowl.jpg',
    url: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/rice-with-zucchini-soft-boiled-egg-and-parsley-in-green-ceramic-plate-1410235/',
    author: 'Lum3n',
    description: 'Protein rice bowl with zucchini, eggs, and parsley',
    category: 'Dinner'
  },
  {
    filename: 'berries-bowl.jpg',
    url: 'https://images.pexels.com/photos/1120575/pexels-photo-1120575.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/blueberries-and-strawberries-in-white-ceramic-bowl-1120575/',
    author: 'Suzy Hazelwood',
    description: 'Summer berries served in a ceramic bowl',
    category: 'Snack'
  },
  {
    filename: 'gourmet-toast.jpg',
    url: 'https://images.pexels.com/photos/793785/pexels-photo-793785.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/slice-of-eggs-on-cakes-793785/',
    author: 'Jane Trang Doan',
    description: 'Avocado toast with poached eggs and pomegranate seeds',
    category: 'Breakfast'
  },
  {
    filename: 'tropical-fruit-stack.jpg',
    url: 'https://images.pexels.com/photos/1171170/pexels-photo-1171170.jpeg?auto=compress&cs=tinysrgb&w=1200',
    sourcePage: 'https://www.pexels.com/photo/top-view-photo-of-assorted-fruits-1171170/',
    author: 'Jane Trang Doan',
    description: 'Stacked tropical fruit slices on a marble surface',
    category: 'Dessert'
  }
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(item) {
  const destination = path.join(outputDir, item.filename);
  if (!force && (await fileExists(destination))) {
    return { ...item, status: 'skipped' };
  }

  const response = await fetch(item.url, {
    headers: { 'User-Agent': 'healthy-care-assets-downloader/1.0' }
  });
  if (!response.ok) {
    throw new Error(`Failed to download ${item.filename}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(destination, Buffer.from(arrayBuffer));
  return { ...item, status: 'downloaded' };
}

async function writeManifest(items) {
  const payload = items.map((item) => ({
    filename: item.filename,
    path: `/images/food-diary/${item.filename}`,
    description: item.description,
    category: item.category,
    author: item.author,
    sourcePage: item.sourcePage,
    license: 'Pexels License'
  }));
  await fs.writeFile(manifestPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function main() {
  console.log('📸 Downloading curated food imagery from Pexels');
  await ensureDir(outputDir);

  const results = [];
  for (const item of FOOD_IMAGES) {
    try {
      const result = await downloadImage(item);
      results.push(result);
      console.log(` - ${item.filename} ${result.status}`);
    } catch (error) {
      console.error(` - ${item.filename} failed:`, error.message);
    }
  }

  await writeManifest(results);

  const downloaded = results.filter((r) => r.status === 'downloaded').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  console.log(`\nDone. ${downloaded} downloaded, ${skipped} skipped.`);
  console.log(`Manifest: ${path.relative(projectRoot, manifestPath)}`);
}

main().catch((error) => {
  console.error('Unexpected error while downloading images:', error);
  process.exitCode = 1;
});
