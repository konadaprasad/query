const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
const connecting_server_and_db = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

connecting_server_and_db();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q, priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE "%${search_q}%";`;
  }
  console.log(getTodosQuery);

  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getBookQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const result = await db.get(getBookQuery);
  response.send({
    id: todoId,
    todo: result.todo,
    priority: result.priority,
    status: result.status,
  });
});

app.post("/todos/", async (request, response) => {
  const details = request.body;
  const { id, todo, priority, status } = details;
  const addMovieQuery = `INSERT INTO 
    todo (id,status,priority,status) 
    VALUES 
    (${id},"${todo}",
    "${priority}","${status}");`;
  const resultItem = await db.run(addMovieQuery);
  response.send("Todo Successfully Added");
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateDetails = request.body;
  const { priority = "", todo = "", status = "" } = updateDetails;
  let updateQuery = "";
  let todoItem = "";
  console.log(updateDetails.status);
  switch (true) {
    case updateDetails.status !== undefined:
      updateQuery = `UPDATE todo SET status='${status}';`;
      todoItem = "Status";
      break;
    case (updateDetails.status = undefined):
      updateQuery = `UPDATE todo SET priority='${priority}';`;
      todoItem = "Priority";
      break;
    case hastodo(request.query):
      updateQuery = `UPDATE todo SET todo='${todo}';`;
      todoItem = "Todo";
      break;

    default:
      console.log("not found");
      break;
  }

  await db.run(updateQuery);
  response.send(`${todoItem} Updated`);
});
