'use client';

import React from 'react';
import { StoreProvider } from '@/lib/storage/store-context';
import { QuickAddModal } from '@/components/modals/quick-add-modal';
import { TaskDrawer } from '@/components/modals/task-drawer';
import { HabitDrawer } from '@/components/modals/habit-drawer';
import { ShortcutsModal } from '@/components/modals/shortcuts-modal';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <QuickAddModal />
      <TaskDrawer />
      <HabitDrawer />
      <ShortcutsModal />
    </StoreProvider>
  );
}
