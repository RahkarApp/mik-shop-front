'use client';
import CategoryModal from './CategoryModal ';

export default function CategoryFilterModal({open, onClose, selectedCategory, onSelect}) {
  return <CategoryModal isOpen={open} onClose={onClose} selectedCategory={selectedCategory} onSelect={onSelect}/>;
}
