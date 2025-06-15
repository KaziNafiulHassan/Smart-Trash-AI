:param {
  // Define the file path root and the individual file names required for loading.
  // https://neo4j.com/docs/operations-manual/current/configuration/file-locations/
  file_path_root: 'file:///', // Change this to the folder your script can access the files at.
  file_0: 'waste_items.csv',
  file_1: 'categories.csv'
};

// CONSTRAINT creation
// -------------------
//
// Create node uniqueness constraints, ensuring no duplicates for the given node label and ID property exist in the database. This also ensures no duplicates are introduced in future.
//
// NOTE: The following constraint creation syntax is generated based on the current connected database version 5.27.0.
CREATE CONSTRAINT `id_Waste_Item_uniq` IF NOT EXISTS
FOR (n: `Waste Item`)
REQUIRE (n.`id`) IS UNIQUE;
CREATE CONSTRAINT `id_Category_uniq` IF NOT EXISTS
FOR (n: `Category`)
REQUIRE (n.`id`) IS UNIQUE;
CREATE CONSTRAINT `bin_type_Bin_uniq` IF NOT EXISTS
FOR (n: `Bin`)
REQUIRE (n.`bin_type`) IS UNIQUE;
CREATE CONSTRAINT `recyclingCenter_Recycling_Center_uniq` IF NOT EXISTS
FOR (n: `Recycling Center`)
REQUIRE (n.`recyclingCenter`) IS UNIQUE;
CREATE CONSTRAINT `material_Material_uniq` IF NOT EXISTS
FOR (n: `Material`)
REQUIRE (n.`material`) IS UNIQUE;
CREATE CONSTRAINT `instruction_en_Instruction_uniq` IF NOT EXISTS
FOR (n: `Instruction`)
REQUIRE (n.`instruction_en`) IS UNIQUE;

:param {
  idsToSkip: []
};

// NODE load
// ---------
//
// Load nodes in batches, one node label at a time. Nodes will be created using a MERGE statement to ensure a node with the same label and ID property remains unique. Pre-existing nodes found by a MERGE statement will have their other properties set to the latest values encountered in a load file.
//
// NOTE: Any nodes with IDs in the 'idsToSkip' list parameter will not be loaded.
LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`id` IN $idsToSkip AND NOT row.`id` IS NULL
CALL {
  WITH row
  MERGE (n: `Waste Item` { `id`: row.`id` })
  SET n.`id` = row.`id`
  SET n.`item_name_en` = row.`item_name_en`
  SET n.`item_name_de` = row.`item_name_de`
  SET n.`category_id` = row.`category_id`
  SET n.`material` = row.`material`
  SET n.`instruction_en` = row.`instruction_en`
  SET n.`instruction_de` = row.`instruction_de`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_1) AS row
WITH row
WHERE NOT row.`id` IN $idsToSkip AND NOT row.`id` IS NULL
CALL {
  WITH row
  MERGE (n: `Category` { `id`: row.`id` })
  SET n.`id` = row.`id`
  SET n.`name_en` = row.`name_en`
  SET n.`name_de` = row.`name_de`
  SET n.`bin_type` = row.`bin_type`
  SET n.`bin_color` = row.`bin_color`
  SET n.`recyclingCenter` = row.`recyclingCenter`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_1) AS row
WITH row
WHERE NOT row.`bin_type` IN $idsToSkip AND NOT row.`bin_type` IS NULL
CALL {
  WITH row
  MERGE (n: `Bin` { `bin_type`: row.`bin_type` })
  SET n.`bin_type` = row.`bin_type`
  SET n.`bin_color` = row.`bin_color`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_1) AS row
WITH row
WHERE NOT row.`recyclingCenter` IN $idsToSkip AND NOT row.`recyclingCenter` IS NULL
CALL {
  WITH row
  MERGE (n: `Recycling Center` { `recyclingCenter`: row.`recyclingCenter` })
  SET n.`recyclingCenter` = row.`recyclingCenter`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`material` IN $idsToSkip AND NOT row.`material` IS NULL
CALL {
  WITH row
  MERGE (n: `Material` { `material`: row.`material` })
  SET n.`material` = row.`material`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`instruction_en` IN $idsToSkip AND NOT row.`instruction_en` IS NULL
CALL {
  WITH row
  MERGE (n: `Instruction` { `instruction_en`: row.`instruction_en` })
  SET n.`instruction_en` = row.`instruction_en`
  SET n.`instruction_de` = row.`instruction_de`
} IN TRANSACTIONS OF 10000 ROWS;


// RELATIONSHIP load
// -----------------
//
// Load relationships in batches, one relationship type at a time. Relationships are created using a MERGE statement, meaning only one relationship of a given type will ever be created between a pair of nodes.
LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Waste Item` { `id`: row.`id` })
  MATCH (target: `Category` { `id`: row.`category_id` })
  MERGE (source)-[r: `BELONGS_TO`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Waste Item` { `id`: row.`id` })
  MATCH (target: `Material` { `material`: row.`material` })
  MERGE (source)-[r: `MADE_OF`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Waste Item` { `id`: row.`id` })
  MATCH (target: `Instruction` { `instruction_en`: row.`instruction_en` })
  MERGE (source)-[r: `FOLLOW`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_1) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Category` { `id`: row.`id` })
  MATCH (target: `Bin` { `bin_type`: row.`bin_type` })
  MERGE (source)-[r: `SORTED_INTO`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_1) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Category` { `id`: row.`id` })
  MATCH (target: `Recycling Center` { `recyclingCenter`: row.`recyclingCenter` })
  MERGE (source)-[r: `DROPPED_AT`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;
