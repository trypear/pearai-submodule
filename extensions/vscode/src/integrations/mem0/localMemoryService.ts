import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Memory as LocalMemory, MemoryChange } from './types';
import { Memory as APIMemory } from '../../util/integrationUtils';

const MEMORIES_FILE = 'memories.json';

function convertToAPIMemory(localMemory: LocalMemory): APIMemory {
    return {
        id: localMemory.id,
        memory: localMemory.content,
        created_at: localMemory.timestamp,
        updated_at: localMemory.timestamp,
        total_memories: 1,
        owner: '',
        organization: '',
        metadata: {},
        type: 'manual'
    };
}

export function getMemoriesFilePath(): string {
    const pearaiPath = process.env.CONTINUE_GLOBAL_DIR ?? path.join(os.homedir(), '.pearai');
    return path.join(pearaiPath, MEMORIES_FILE);
}

export function initializeMemoriesFile(): void {
    const filePath = getMemoriesFilePath();
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
}

export function readMemories(): APIMemory[] {
    try {
        initializeMemoriesFile();
        const content = fs.readFileSync(getMemoriesFilePath(), 'utf8');
        const localMemories = JSON.parse(content) as LocalMemory[];
        return localMemories.map(convertToAPIMemory);
    } catch (error) {
        console.error('Error reading memories:', error);
        return [];
    }
}

export function writeMemories(memories: LocalMemory[]): boolean {
    try {
        fs.writeFileSync(getMemoriesFilePath(), JSON.stringify(memories, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing memories:', error);
        return false;
    }
}

export function updateMemories(changes: MemoryChange[]): boolean {
    try {
        const localMemories = JSON.parse(fs.readFileSync(getMemoriesFilePath(), 'utf8')) as LocalMemory[];
        
        changes.forEach(change => {
            switch (change.type) {
                case 'new':
                    if (!change.content) return false;
                    localMemories.unshift({
                        id: change.id,
                        content: change.content,
                        timestamp: new Date().toISOString()
                    });
                    break;
                    
                case 'edit':
                    const editIndex = localMemories.findIndex(m => m.id === change.id);
                    if (editIndex !== -1 && change.content) {
                        localMemories[editIndex] = {
                            ...localMemories[editIndex],
                            content: change.content,
                            timestamp: new Date().toISOString()
                        };
                    }
                    break;
                    
                case 'delete':
                    const deleteIndex = localMemories.findIndex(m => m.id === change.id);
                    if (deleteIndex !== -1) {
                        localMemories.splice(deleteIndex, 1);
                    }
                    break;
            }
        });
        
        return writeMemories(localMemories);
    } catch (error) {
        console.error('Error updating memories:', error);
        return false;
    }
} 
