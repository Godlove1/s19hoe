"use client"


import React from 'react'
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { useFirestoreQuery } from '@/lib/firebaseHooks';

export default function Categories({ setSelectedCategory, selectedCategory }) {
  
  const { data: categories, loading, error } = useFirestoreQuery("allCategories");

  if (error) return <div>Error: {error}</div>;
  if (loading) return <div className='text-center italic mt-4 text-gray-400 animate-pulse'>Loading categories</div>;
  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border mt-3 lg:mt-8">
        <div className="flex w-max space-x-4 p-4">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={
              selectedCategory === 'all' ? "default" : "outline"
            }
            className="flex-shrink-0"
          >
           All
          </Button>
          {categories?.map((category, i) => (
            <Button
              key={i}
              onClick={() => setSelectedCategory(category?.id)}
              variant={
                selectedCategory === category?.id ? "default" : "outline"
              }
              className="flex-shrink-0"
            >
              {category?.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}
