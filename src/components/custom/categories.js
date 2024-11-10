"use client"


import React from 'react'
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Button } from '../ui/button';

export default function Categories({categories,setSelectedCategory, selectedCategory}) {
  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border mt-3 lg:mt-8">
        <div className="flex w-max space-x-4 p-4">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className="flex-shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}
