import { ItemType } from '../model/item-type';

const RESOURCE: ItemType = {
  title: 'Resource',
  key: 'resource',
  description: 'A resource that can be harvested or collected.',
};

const TOOL: ItemType = {
  title: 'Tool',
  key: 'tool',
  description: 'A tool that can be used to execute or facilitate a task.',
};

const HARVEST_TOOL: ItemType = {
  parent: TOOL,
  title: 'Harvest Tool',
  key: 'harvest-tool',
  description: 'A tool that can be used to harvest or collect resources.',
};

const CRAFTING_TOOL: ItemType = {
  parent: TOOL,
  title: 'Crafting Tool',
  key: 'crafting-tool',
  description: 'A tool that can be used to create of improve other items.',
};

const UTILITY_TOOL: ItemType = {
  parent: TOOL,
  title: 'Utility Tool',
  key: 'utulity-tool',
  description: 'A tool that can be used to perform specific tasks.',
};
const TRAVEL_TOOL: ItemType = {
  parent: TOOL,
  title: 'Utility Tool',
  key: 'utulity-tool',
  description: 'A tool that can be used to perform specific tasks.',
};
