const { app, PORT } = require("./app");

app.listen(PORT, () => {
  console.log(`\n  MAJAN is running → http://localhost:${PORT}\n`);
});
