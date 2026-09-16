const { app, PORT } = require("./app");

app.listen(PORT, () => {
  console.log(`\n  TERMINAL CITY is running → http://localhost:${PORT}\n`);
});
