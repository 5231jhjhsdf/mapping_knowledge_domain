const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3005;

app.use(cors({ origin: '*' }));

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '123456789'));

// 定义一个颜色映射，可以根据需要扩展
const colorMap = {
  Disease_category: '#63bf5a',
  Disease_subdivision: '#66ace6',
  MedicalSymptom: '#ebe124',
  MedicalCategory: "#2ba1d4",
  神经系统疾病相关关系: '#63bf5a',
  失眠关系: '#63bf5a',
  睡眠呼吸障碍关系: '#63bf5a',
  睡眠相关性运动障碍关系: '#63bf5a',
  中枢性睡眠增多关系: '#63bf5a',
  昼夜节律失调关系: '#63bf5a',
  精神疾病相关关系: '#63bf5a',
  昼夜节律失调关系: '#63bf5a',
  异态睡眠关系: '#63bf5a',
  神经系统疾病相关节点: '#ebe124',
  失眠节点: '#ebe124',
  睡眠呼吸障碍节点: '#ebe124',
  睡眠相关性运动障碍节点: '#ebe124',
  中枢性睡眠增多节点: '#ebe124',
  昼夜节律失调节点: '#ebe124',
  精神疾病相关节点: '#ebe124',
  异态睡眠节点: '#ebe124'

};

// 定义查询
const queries = {
  data2: `
    MATCH (entity1:Disease_category)-[r:包含]->(entity2:Disease_subdivision)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  dataSingleNodes: `
    MATCH (entity1:MedicalCategory)-[r:状]->(entity2:MedicalSymptom)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  d1: `
    MATCH (entity1:神经系统疾病相关关系)-[r:精神系统]->(entity2:神经系统疾病相关节点)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  d2: `
    MATCH (entity1:失眠关系)-[r:失]->(entity2:失眠节点)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  d3: `
    MATCH (entity1:睡眠呼吸障碍关系)-[r:睡眠呼吸障碍]->(entity2:睡眠呼吸障碍节点)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  d4: `
    MATCH (entity1:睡眠相关性运动障碍关系)-[r:运动障碍关联]->(entity2:睡眠相关性运动障碍节点)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  d5: `
    MATCH (entity1:中枢性睡眠增多关系)-[r:中枢性睡眠增多]->(entity2:中枢性睡眠增多节点)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  d6: `
    MATCH (entity1:昼夜节律失调关系)-[r:昼夜节律失调]->(entity2:昼夜节律失调节点)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  d7: `
    MATCH (entity1:精神疾病相关关系)-[r:精神疾病]->(entity2:精神疾病相关节点)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `,
  d8: `
    MATCH (entity1:异态睡眠关系)-[r:异态睡眠]->(entity2:异态睡眠节点)
    RETURN entity1, r, entity2, labels(entity1) AS entity1Labels, labels(entity2) AS entity2Labels LIMIT 100;
  `
};

const createRoute = (route, query) => {
  app.get(`/${route}`, async (req, res) => {
    const session = driver.session();
    try {
      const result = await session.run(query);
      const nodes = new Map();
      const edges = [];

      result.records.forEach(record => {
        const entity1 = record.get('entity1');
        const relationship = record.get('r');
        const entity2 = record.get('entity2');

        if (!entity1 || !relationship || !entity2) {
          console.warn('Missing data in record:', record);
          return;
        }

        const entity1Labels = record.get('entity1Labels');
        const entity2Labels = record.get('entity2Labels');

        // 提取节点属性并设置颜色
        const node1 = {
          id: entity1.identity.toString(),
          name: entity1.properties.name || entity1.identity.toString(),
          type: entity1Labels[0],
          color: colorMap[entity1Labels[0]] || '#ccc',
        };

        const node2 = {
          id: entity2.identity.toString(),
          name: entity2.properties.name || entity2.identity.toString(),
          type: entity2Labels[0],
          color: colorMap[entity2Labels[0]] || '#ccc',
        };

        nodes.set(node1.id, node1);
        nodes.set(node2.id, node2);

        // 创建边（移除label属性）
        edges.push({
          source: node1.id,
          target: node2.id
        });
      });

      // 转换成echarts可识别的格式
      const echartsNodes = Array.from(nodes.values()).map(node => ({
        id: node.id,
        name: node.name,
        itemStyle: {
          color: node.color
        },
        value: 10,
        symbolSize: 30
      }));

      const echartsEdges = edges.map(edge => ({
        source: edge.source,
        target: edge.target
      }));

      res.json({ nodes: echartsNodes, edges: echartsEdges });
    } catch (error) {
      console.error(`Error running ${route}:`, error);
      res.status(500).send('Internal Server Error');
    } finally {
      await session.close();
    }
  });
};

// 为每个页面创建路由
createRoute('d1', queries.d1);
createRoute('d2', queries.d2);
createRoute('d3', queries.d3);
createRoute('d4', queries.d4);
createRoute('d5', queries.d5);
createRoute('d6', queries.d6);
createRoute('d7', queries.d7);
createRoute('d8', queries.d8);

// 处理data2路由的函数
const createData2Route = (route, query) => {
  app.get(`/${route}`, async (req, res) => {
    const session = driver.session();
    try {
      const result = await session.run(query);
      const nodes = new Map();
      const edges = [];

      result.records.forEach(record => {
        const entity1 = record.get('entity1');
        const relationship = record.get('r');
        const entity2 = record.get('entity2');

        if (!entity1 || !relationship || !entity2) {
          console.warn('Missing data in record:', record);
          return;
        }

        const entity1Labels = record.get('entity1Labels');
        const entity2Labels = record.get('entity2Labels');

        // 提取节点属性并设置颜色
        const node1 = {
          id: entity1.identity.toString(),
          name: entity1.properties.name || entity1.identity.toString(),
          type: entity1Labels[0],
          color: colorMap[entity1Labels[0]] || '#ccc',
        };

        const node2 = {
          id: entity2.identity.toString(),
          name: entity2.properties.name || entity2.identity.toString(),
          type: entity2Labels[0],
          color: colorMap[entity2Labels[0]] || '#ccc',
        };

        nodes.set(node1.id, node1);
        nodes.set(node2.id, node2);

        // 创建边（移除label属性）
        edges.push({
          source: node1.id,
          target: node2.id
        });
      });

      // 转换成echarts可识别的格式
      const echartsNodes = Array.from(nodes.values()).map(node => ({
        id: node.id,
        name: node.name,
        itemStyle: {
          color: node.color
        },
        value: 10,
        symbolSize: 30
      }));

      const echartsEdges = edges.map(edge => ({
        source: edge.source,
        target: edge.target
      }));

      res.json({ nodes: echartsNodes, edges: echartsEdges });
    } catch (error) {
      console.error(`Error running ${route}:`, error);
      res.status(500).send('Internal Server Error');
    } finally {
      await session.close();
    }
  });
};

// 处理dataSingleNodes路由的函数
const createDataSingleNodesRoute = (route, query) => {
  app.get(`/${route}`, async (req, res) => {
    const session = driver.session();
    try {
      const result = await session.run(query);
      const nodes = new Map();
      const edges = [];

      result.records.forEach(record => {
        const entity1 = record.get('entity1');
        const relationship = record.get('r');
        const entity2 = record.get('entity2');

        if (!entity1 || !relationship || !entity2) {
          console.warn('Missing data in record:', record);
          return;
        }

        const entity1Labels = record.get('entity1Labels');
        const entity2Labels = record.get('entity2Labels');

        // 提取节点属性并设置颜色
        const node1 = {
          id: entity1.identity.toString(),
          name: entity1.properties.name || entity1.identity.toString(),
          type: entity1Labels[0],
          color: colorMap[entity1Labels[0]] || '#ccc',
        };

        const node2 = {
          id: entity2.identity.toString(),
          name: entity2.properties.name || entity2.identity.toString(),
          type: entity2Labels[0],
          color: colorMap[entity2Labels[0]] || '#ccc',
        };

        nodes.set(node1.id, node1);
        nodes.set(node2.id, node2);

        // 创建边（移除label属性）
        edges.push({
          source: node1.id,
          target: node2.id
        });
      });

      // 转换成echarts可识别的格式
      const echartsNodes = Array.from(nodes.values()).map(node => ({
        id: node.id,
        name: node.name,
        itemStyle: {
          color: node.color
        },
        value: 10,
        symbolSize: 30
      }));

      const echartsEdges = edges.map(edge => ({
        source: edge.source,
        target: edge.target
      }));

      res.json({ nodes: echartsNodes, edges: echartsEdges });
    } catch (error) {
      console.error(`Error running ${route}:`, error);
      res.status(500).send('Internal Server Error');
    } finally {
      await session.close();
    }
  });
};


// 创建data2路由
createData2Route('data2', queries.data2);

// 创建dataSingleNodes路由
createDataSingleNodesRoute('dataSingleNodes', queries.dataSingleNodes);

// 启动服务器
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});