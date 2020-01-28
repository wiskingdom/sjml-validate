const fs = require('fs');
const { Xsd2JsonSchema } = require('xsd2jsonschema');

const XML_SCHEMA = fs.readFileSync('xsds/wr.xsd', 'utf8');

const xs2js = new Xsd2JsonSchema();

const convertedSchemas = xs2js.processAllSchemas({
	schemas: {'wr.xsd': XML_SCHEMA}
});

const jsonSchema = convertedSchemas['wr.xsd'].getJsonSchema();

fs.writeFileSync('out.json', JSON.stringify(jsonSchema, null, 2));