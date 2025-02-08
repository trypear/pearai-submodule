export interface Memory {
  id: string;
  content: string;
  timestamp: string;
  isNew?: boolean;
  isModified?: boolean;
  isDeleted?: boolean;
}

export interface MemoryChange {
  type: 'edit' | 'delete' | 'new';
  id: string;
  content?: string;
}

export interface StatusCardProps {
  title: string;
  description: string;
  icon: 'brain' | 'search';
  showSparkles?: boolean;
  animate?: boolean;
  secondaryDescription?: string;
} 