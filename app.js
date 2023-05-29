const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json())

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const databaseConnection = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000)
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
databaseConnection();

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = "";
  let getData = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatus(request.query):
      getData = `select * from  todo where todo like '%${search_q}' and status='${status}' and priority='${priority}';`;
      break;
    case hasPriority(request.query):
      getData = `select * from  todo where todo like '%${search_q}' and priority='${priority}';`;
      break;
    case hasStatus(request.query):
      getData = `select * from  todo where todo like '%${search_q}' and status='${status}';`;
      break;
    default:
      getData = `select * from  todo where todo like '%${search_q}'`;
      break;
  }
  data = await db.all(getData);
  response.send(data);
});

app.get("/todos/:todoId/", async (request.response) => {
  const { todoId } = request.params;
  const getQuery = `select * from todo where id= ${todoId}`;
  const todoData = await db.get(getQuery);
  response.send(todoData);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const insertData = `insert into todo(id,todo,priority,status)values(${id},'${todo}','${priority}','${status}')`;
  await db.run(insertData);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const reqBody = request.body;
  const updateCol = "";
  switch (true) {
    case reqBody.status !== undefined:
      updateCol = "Status";
      break;
    case reqBody.priority !== undefined:
      updateCol = "Priority";
      break;
    case reqBody.todo !== undefined:
      updateCol = "Todo";
      break;
  }
  const previousQuery = `select * from todo where id=${todoId}`;
  const previousTodo = await db.get(previousQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateQuery = `update todo set todo='${todo}',priority='${priority}',status='${status}'where id=${todoId}`;
  await db.run(updateQuery);
  response.send(`${updateCol} Updated`);
});

app.delete("/todos/:todoId/", async(request,response)={
    const{todoId}=request.params;
    const deleteQuery=`delete from todo where id=${todoId}`
    await db.run(deleteQuery)
    response.send("Todo Deleted")
})

//export default app;
