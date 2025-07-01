'use client';

import React from 'react';
import type { HTMLAttributes } from 'react';

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-md p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`text-2xl font-bold text-gray-900 ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
