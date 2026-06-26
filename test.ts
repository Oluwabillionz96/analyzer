import pool from "./libs/db";

const test = async () => {
  const response = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'analyses'`",
  );

  console.log(response);
};

test()
