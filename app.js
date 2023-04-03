const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running.... ^_^");
    });
  } catch (e) {
    console(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getting = `
    SELECT *
    FROM todo 
    WHERE Id=${todoId}
    ;`;
  const required = await db.get(getting);
  response.send(required);
});

app.post("/todos/", async (request, response) => {
  const tabledetails = request.params;
  const { id, todo, priority, status } = tabledetails;

  const closer = `
    INSERT INTO todo(id,todo,priority,status)
    VALUES ('${id}','${todo}','${priority}','${status}');`;

  const chandel = await db.run(closer);
  response.send("Todo Successfully Added");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const achar = `
    DELETE FROM todo 
    WHERE id='${todoId}';`;
  const lable = await db.run(achar);
  response.send("Todo Deleted");
});

const bothpriorityandstatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const statusistodo = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const priorityistodo = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case bothpriorityandstatus(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%' AND priority='${priority}' AND status='${status}';`;
      break;

    case statusistodo(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo 
            WHERE todo LIKE '%${search_q}%' AND status LIKE '${status}';`;
      break;

    case priorityistodo(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%' AND priority='${priority}';`;
      break;
    default:
      getTodosQuery = `
            SELECT
                  *
            FROM
            todo 
            WHERE
            todo LIKE '%${search_q}%';`;
  }
  const data = await db.all(getTodosQuery);
  response.send(data);
});

const followingfirst = (requestquery) => {
  return requestquery.status !== undefined;
};
const followingsecond = (requestquery) => {
  return requestquery.priority !== undefined;
};
const followingthird = (requestquery) => {
  return requestquery.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let doingsecondpart = "";

  switch (true) {
    case followingfirst(request.body):
      doingsecondpart = `
           UPDATE todo
           SET 
           status='${status}'
           WHERE id=${todoId};`;
      await db.run(doingsecondpart);
      response.send("Status Updated");
      break;

    case followingsecond(request.body):
      doingsecondpart = `
        UPDATE todo
        SET 
        priority='${priority}'
        WHERE id=${todoId};`;
      await db.run(doingsecondpart);
      response.send("Priority Updated");
      break;

    case followingthird(request.body):
      doingsecondpart = `
        UPDATE todo
        SET 
        todo='${todo}'
        WHERE id=${todoId};`;
      await db.run(doingsecondpart);
      response.send("Todo Updated");
      break;
  }
});

module.exports = app;
