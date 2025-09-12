import { Pool } from 'pg';

const vocabulary = {
  "Animals": ["bear", "bird", "cat", "cow", "dog", "duck", "elephant", "fish", "horse", "monkey", "pig", "rabbit/bunny", "sheep"],
  "Household": ["bathtub", "chair", "cup", "door", "knife", "phone", "potty/toilet", "spoon", "table", "toothbrush"],
  "Body Parts": ["ear", "eyes", "foot", "hair", "hand", "mouth", "nose", "teeth"],
  "Clothes": ["boot/s", "coat", "diaper", "hat", "pants", "shirt", "shoe/s", "sock/s"],
  "Nature": ["flower", "rain", "sun", "tree"],
  "People": ["baby", "boy", "Daddy", "girl", "Mommy"],
  "Food": ["apple", "banana", "candy", "cheese", "cookie", "cracker", "French fries", "hamburger", "hotdog", "ice cream cone", "juice", "milk", "pizza", "strawberry", "water"],
  "Toys/Travel": ["airplane", "ball", "balloon", "bike", "book", "bubbles", "car", "train"],
  "Action Words/Verbs": ["blow", "clap", "cry", "cut", "drink", "drive", "drop", "eat", "fall down", "hug", "jump", "kick", "kiss", "open", "pour", "push", "run", "sit down", "sleep", "stir", "throw", "turn around", "walk", "wash"],
  "Adjectives": ["blue", "green", "orange", "purple", "red", "yellow", "one", "two", "three", "big/little", "clean/dirty", "happy/sad", "hot/cold"]
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/lamdb',
});

async function seed() {
  console.log('Seeding vocabulary...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const category in vocabulary) {
      for (const word of vocabulary[category as keyof typeof vocabulary]) {
        await client.query('INSERT INTO words (category, word) VALUES ($1, $2) ON CONFLICT (word) DO NOTHING', [category, word]);
      }
    }
    await client.query('COMMIT');
    console.log('Vocabulary seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding vocabulary:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
