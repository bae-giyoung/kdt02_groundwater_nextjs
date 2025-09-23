'use client';
import { UserType } from '@/types/uiTypes';
import { atom } from 'jotai';

// 현재 페이지
export const pathnameAtom = atom<string>("/");

// 사용자
export const isLoginAtom = atom<boolean>(false);