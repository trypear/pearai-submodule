import * as vscode from 'vscode';
import { PearAuth } from 'core';
import { ConfigHandler } from 'core/config/ConfigHandler';
import { Core } from 'core/core';
import { PearAICreatorMode } from './integrations/creator';
import { InProcessMessenger } from 'core/util/messenger';
import { FromCoreProtocol, ToCoreProtocol } from 'core/protocol';

/**
 * Public interface for the PearAI Extension API
 * This interface defines the public classes that other extensions can use
 */
export interface IPearAIApi {
  readonly creatorMode: PearAICreatorMode;
}

export class PearAIApi implements IPearAIApi {

    readonly creatorMode = new PearAICreatorMode(new InProcessMessenger<
      ToCoreProtocol,
      FromCoreProtocol
    >());
}