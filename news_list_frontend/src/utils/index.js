const neo4j = require('neo4j-driver');
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("test1019", "test1019"));
const session = driver.session();
export const  getNewsList = async() => {
    console.log("sdfsdf");
    let skipNum = 0;

    try {
      const result = await session.run(
        'MATCH (a:News) RETURN a LIMIT 10',
      )

      return result.records.map((ele) => {
        return ele._fields  
      })
      

      // console.log(node.properties.name)
    } finally {
      console.log("오지 ???")
      await session.close()
    }

    // on application exit:
    await driver.close()
  }