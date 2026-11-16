// Runs before every test file. Half the contract tests run in the node environment (they read
// files, not the DOM), so the DOM patches only apply when a document is present.
import { installDom } from './dom';

// React refuses to run act() unless the environment opts in.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof document !== 'undefined' && typeof HTMLElement !== 'undefined') installDom();
