import { createWorkspace } from '@expo-workspaces/core';

import { workspaceExecutors, workspaceGenerators } from './engine';

export const withWorkspace = createWorkspace({
  generators: workspaceGenerators,
  executors: workspaceExecutors,
});
