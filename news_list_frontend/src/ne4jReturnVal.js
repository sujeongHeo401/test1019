import logo from './logo.svg';
import './App.css';
import React, { useEffect } from 'react';
var neo4j = require('neo4j-driver').v1;
const session = driver.session();

const resultPromise = session.run(
  'CREATE (a:Person {name: $name}) RETURN a',
  {name: personName}
);

resultPromise.then(result => {
  session.close();

  const singleRecord = result.records[0];
  const node = singleRecord.get(0);

  console.log(node.properties.name);

  // on application exit:
  driver.close();
});