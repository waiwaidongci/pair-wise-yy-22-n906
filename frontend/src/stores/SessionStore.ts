import { create } from "zustand";
import { UserRole } from "../constants/UserRole";
import { mockUsers } from "../mocks/seedData";

export type SessionUser = { id: number; name: string; role: UserRole | string };

type State = {
  user: SessionUser;
  setUser: (id: number) => void;
};

const firstRestorer = mockUsers.find((item) => item.role === UserRole.RESTORER) ?? mockUsers[0];

export const useSessionStore = create<State>((set) => ({
  user: { id: firstRestorer.id, name: firstRestorer.name, role: firstRestorer.role },
  setUser: (id: number) => {
    const next = mockUsers.find((item) => item.id === id) ?? firstRestorer;
    set({ user: { id: next.id, name: next.name, role: next.role } });
  }
}));

export const sessionUsers = mockUsers;
