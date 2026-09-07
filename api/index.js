const express = require('express');
const usersRoutes = require('./routes/users.routes');
const healthCheck = require('./routes/healthCheck.routes');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/users', usersRoutes);
app.use('/health-check', healthCheck);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    console.error('[JSON Parse Error]', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Startup Error] Port ${port} is already in use.`);
  } else {
    console.error('[Startup Error]', err.message);
  }
  process.exit(1);
});