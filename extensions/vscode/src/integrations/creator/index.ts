import * as vscode from 'vscode';

/**
 * Interface for the Creator Mode API
 * Provides methods and events for controlling the Creator Mode UI and functionality
 */
export interface IPearAICreatorMode {
  /**
   * Whether the creator mode interface is currently opened
   */
  readonly isCreatorModeActive: boolean;

  /**
   * Event that fires when the creator mode is activated or deactivated
   */
  readonly onDidChangeCreatorModeState: vscode.Event<boolean>;

  /**
   * Event that fires when a new task should be created
   * Other extensions can listen to this event to handle task creation
   */
  readonly onDidRequestNewTask: vscode.Event<CreatorTaskRequest>;

  /**
   * Event that fires when a plan has been created and needs to be executed
   */
  readonly onDidRequestExecutePlan: vscode.Event<ExecutePlanRequest>;

  /**
   * Opens the creator mode interface
   * @returns A Promise that resolves when the interface is opened
   */
  openCreatorMode(): Promise<void>;

  /**
   * Closes the creator mode interface
   * @returns A Promise that resolves when the interface is closed
   */
  closeCreatorMode(): Promise<void>;

  /**
   * Creates a new task in creator mode
   * @param task The task details
   * @returns A Promise that resolves when the task is created
   */
  createTask(task: CreatorTaskRequest): Promise<void>;

  /**
   * Disposes of resources used by the creator mode
   */
  dispose(): void;
}

/**
 * Represents a request to create a new task in creator mode
 */
export interface CreatorTaskRequest {
  /**
   * The text of the task
   */
  text: string;
  
  /**
   * Optional base64-encoded images to include with the task
   */
  images?: string[];
}

/**
 * Represents a request to execute a plan
 */
export interface ExecutePlanRequest {
  /**
   * The path to the file containing the plan
   */
  filePath?: string;
  
  /**
   * Optional code to include in the plan execution
   */
  code?: string;
  
  /**
   * Additional context for the plan execution
   */
  context?: string;
}

/**
 * Implementation of the Creator Mode API
 * Manages the creator mode interface state and events
 * TODO: GO OVER ALL OF THESE FUNCTIONS - THEY ARE PLACEHOLDERS AND THEY NEED MODIFYING
 */
export class PearAICreatorMode implements IPearAICreatorMode {
  // Private event emitters
  private readonly _onDidChangeCreatorModeState = new vscode.EventEmitter<boolean>();
  private readonly _onDidRequestNewTask = new vscode.EventEmitter<CreatorTaskRequest>();
  private readonly _onDidRequestExecutePlan = new vscode.EventEmitter<ExecutePlanRequest>();
  
  // Public events
  public readonly onDidChangeCreatorModeState = this._onDidChangeCreatorModeState.event;
  public readonly onDidRequestNewTask = this._onDidRequestNewTask.event;
  public readonly onDidRequestExecutePlan = this._onDidRequestExecutePlan.event;
  
  // Creator mode state
  private _isCreatorModeActive: boolean = false;
  
  // Disposables
  private _disposables: vscode.Disposable[] = [];
  
  /**
   * Whether the creator mode interface is currently active
   */
  public get isCreatorModeActive(): boolean {
    return this._isCreatorModeActive;
  }
  
  /**
   * Opens the creator mode interface
   */
  public async openCreatorMode(): Promise<void> {
    if (this._isCreatorModeActive) {
      return; // Already open
    }
    
    try {
      // Execute the command to open the creator mode interface
      await vscode.commands.executeCommand('workbench.action.toggleCreatorView');
      this._isCreatorModeActive = true;
      this._onDidChangeCreatorModeState.fire(true);
    } catch (error) {
      console.error('Failed to open creator mode:', error);
      throw error;
    }
  }
  
  /**
   * Closes the creator mode interface
   */
  public async closeCreatorMode(): Promise<void> {
    if (!this._isCreatorModeActive) {
      return; // Already closed
    }

    try {
      // Close the creator mode interface
      // This could involve closing the specific webview panel
      await vscode.commands.executeCommand("workbench.action.closeCreatorView");
      this._isCreatorModeActive = false;
      this._onDidChangeCreatorModeState.fire(false);
    } catch (error) {
      console.error('Failed to close creator mode:', error);
      throw error;
    }
  }
  
  /**
   * Whenever we have a new task to execute, this create task method should be called
   * It will fire an event, which the roo code extension will listen to, then it will execute the task
   */
  public async createTask(task: CreatorTaskRequest): Promise<void> {
    

    this._onDidRequestNewTask.fire(task);
    // TODO: setup listeners in roo code
    // TODO: Go trigger creator mode view 
    // TODO: run animation to close overlay
  }
  
  /**
   * Registers commands necessary for creator mode functionality
   */
  // public registerCommands(context: vscode.ExtensionContext): void {
  //   // Register command to open creator mode
  //   const openCreatorModeCmd = vscode.commands.registerCommand('pearai.openCreatorMode', async () => {
  //     await this.openCreatorMode();
  //   });
    
  //   // Register command to close creator mode
  //   const closeCreatorModeCmd = vscode.commands.registerCommand('pearai.closeCreatorMode', async () => {
  //     await this.closeCreatorMode();
  //   });
    
  //   // Register command to create a task
  //   const createTaskCmd = vscode.commands.registerCommand('pearai.createCreatorTask', async (args: CreatorTaskRequest) => {
  //     await this.createTask(args);
  //   });
    
  //   // Register command to execute a plan
  //   const executePlanCmd = vscode.commands.registerCommand('pearai.executeCreatorPlan', async (args: ExecutePlanRequest) => {
  //     await this.executePlan(args);
  //   });
    
  //   // Add commands to context subscriptions
  //   context.subscriptions.push(
  //     openCreatorModeCmd,
  //     closeCreatorModeCmd,
  //     createTaskCmd,
  //     executePlanCmd
  //   );
    
  //   // Add to disposables for cleanup
  //   this._disposables.push(
  //     openCreatorModeCmd,
  //     closeCreatorModeCmd,
  //     createTaskCmd,
  //     executePlanCmd
  //   );
  // }
  
  /**
   * Disposes of resources used by the creator mode
   */
  public dispose(): void {
    // Dispose of event emitters
    this._onDidChangeCreatorModeState.dispose();
    this._onDidRequestNewTask.dispose();
    this._onDidRequestExecutePlan.dispose();
    
    // Dispose of disposables
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }
}