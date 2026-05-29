import fs from 'fs';
import path from 'path';
import { IOSConfig } from '@expo/config-plugins';
import type { Generator } from '@expo-workspaces/core';

import { buildXcscheme } from '../scheme/buildXcscheme';
import { resolveNativeTargets } from '../openProject';
import { pbxOp } from '../pbxOp';
import { normalizeSchemeDefinitions, schemeFileName } from '../validate';
import type { SchemeDefinition } from '../types';

export const schemesGenerator: Generator = {
  name: 'schemes',
  generate({ manifest }) {
    const schemes = normalizeSchemeDefinitions(manifest.schemes as SchemeDefinition[] | undefined);
    if (schemes.length === 0) {
      return { ops: [] };
    }
    const replaceExpoScheme = Boolean(manifest.replaceExpoScheme);

    return {
      ops: [
        pbxOp('schemes', ({ project, projectRoot }) => {
          const xcodeprojPath = IOSConfig.Paths.getXcodeProjectPath(projectRoot);
          const xcodeprojBasename = path.basename(xcodeprojPath);
          const schemesDirectory = path.join(xcodeprojPath, 'xcshareddata', 'xcschemes');
          const targets = resolveNativeTargets(project);

          fs.mkdirSync(schemesDirectory, { recursive: true });
          if (replaceExpoScheme) {
            for (const entry of fs.readdirSync(schemesDirectory)) {
              if (entry.endsWith('.xcscheme')) {
                fs.unlinkSync(path.join(schemesDirectory, entry));
              }
            }
          }

          const context = { targets, xcodeprojBasename };
          for (const scheme of schemes) {
            const contents = buildXcscheme(scheme, context);
            fs.writeFileSync(path.join(schemesDirectory, schemeFileName(scheme.name)), contents, 'utf8');
          }
        }),
      ],
    };
  },
};
