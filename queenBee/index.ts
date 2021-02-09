import express from 'express';
// rest of the code remains same
const app = express();
const PORT = 3000;
app.get('/', (req, res) => res.send('Healthy :)\r\n'));
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});