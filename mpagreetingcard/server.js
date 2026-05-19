const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const GREETINGS_FILE = path.join(__dirname, 'greetings.json');
const MAIN_MESSAGE_FILE = path.join(__dirname, 'main_message.txt');

console.log('\n🚀 Server initializing...');
console.log(`📂 Working directory: ${__dirname}`);
console.log(`📋 Greetings file: ${GREETINGS_FILE}`);
console.log(`📋 Main message file: ${MAIN_MESSAGE_FILE}\n`);

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// GET all greetings
app.get('/api/greetings', (req, res) => {
  console.log('📥 GET /api/greetings requested');
  try {
    console.log(`  📂 Reading file: ${GREETINGS_FILE}`);
    
    if (!fs.existsSync(GREETINGS_FILE)) {
      console.log(`  ⚠️  File does not exist yet. Returning empty array...\n`);
      return res.json([]);
    }
    
    const data = fs.readFileSync(GREETINGS_FILE, 'utf8');
    console.log(`  ✅ File read successfully (${data.length} bytes)`);
    
    const greetings = JSON.parse(data);
    console.log(`  📊 Parsed ${greetings.length} greetings from JSON`);
    
    greetings.forEach((g, i) => {
      console.log(`     [${i}] ${g.name}: "${g.message}" ${g.emoji}`);
    });
    
    console.log(`  📤 Sending response...\n`);
    res.json(greetings);
    
  } catch (error) {
    console.error(`  ❌ Error reading greetings:`, error.message);
    console.error(`     Stack: ${error.stack}\n`);
    res.status(500).json({ error: 'Failed to read greetings', details: error.message });
  }
});

// GET main message
app.get('/api/main-message', (req, res) => {
  console.log('📥 GET /api/main-message requested');
  try {
    console.log(`  📂 Reading file: ${MAIN_MESSAGE_FILE}`);
    
    if (!fs.existsSync(MAIN_MESSAGE_FILE)) {
      console.log(`  ⚠️  File does not exist!\n`);
      return res.status(404).json({ error: 'main_message.txt not found' });
    }
    
    const data = fs.readFileSync(MAIN_MESSAGE_FILE, 'utf8');
    console.log(`  ✅ File read successfully (${data.length} bytes)`);
    console.log(`  📝 Content preview: ${data.substring(0, 80)}...`);
    console.log(`  📤 Sending response...\n`);
    
    res.type('text/plain').send(data);
    
  } catch (error) {
    console.error(`  ❌ Error reading main message:`, error.message);
    console.error(`     Stack: ${error.stack}\n`);
    res.status(500).json({ error: 'Failed to read main message', details: error.message });
  }
});

// POST new greeting
app.post('/api/greetings', (req, res) => {
  console.log('📥 POST /api/greetings received');
  console.log(`  📋 Body: ${JSON.stringify(req.body)}`);
  
  try {
    const { name, message, emoji } = req.body;

    if (!name || !message) {
      console.log(`  ❌ Validation failed: name="${name}", message="${message}"\n`);
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const newGreeting = {
      id: Date.now(),
      name,
      message,
      emoji: emoji || '❤️',
      created_at: new Date().toISOString()
    };
    console.log(`  ✅ Created greeting object:`, newGreeting);

    let greetings = [];
    if (fs.existsSync(GREETINGS_FILE)) {
      console.log(`  📂 Reading existing greetings file...`);
      const data = fs.readFileSync(GREETINGS_FILE, 'utf8');
      greetings = JSON.parse(data);
      console.log(`  ✅ Read ${greetings.length} existing greetings`);
    } else {
      console.log(`  ℹ️  Greetings file doesn't exist yet, creating new...`);
    }

    greetings.push(newGreeting);
    console.log(`  💾 Writing ${greetings.length} total greetings to file...`);
    fs.writeFileSync(GREETINGS_FILE, JSON.stringify(greetings, null, 2));
    console.log(`  ✅ File saved successfully`);
    console.log(`  📤 Sending response...\n`);

    res.status(201).json(newGreeting);
    
  } catch (error) {
    console.error(`  ❌ Error saving greeting:`, error.message);
    console.error(`     Stack: ${error.stack}\n`);
    res.status(500).json({ error: 'Failed to save greeting', details: error.message });
  }
});


  const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('🔄 Ready to handle requests\n');
});