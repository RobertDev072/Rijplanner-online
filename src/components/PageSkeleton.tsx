import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface PageSkeletonProps {
  type?: 'dashboard' | 'list' | 'form' | 'profile';
}

export function PageSkeleton({ type = 'dashboard' }: PageSkeletonProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (type === 'profile') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Profile header skeleton */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (type === 'list') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === 'form') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {[1, 2, 3, 4].map((i) => (
          <motion.div key={i} variants={itemVariants} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </motion.div>
        ))}
        <motion.div variants={itemVariants}>
          <Skeleton className="h-12 w-full rounded-xl" />
        </motion.div>
      </motion.div>
    );
  }

  // Dashboard type
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Greeting skeleton */}
      <motion.div variants={itemVariants} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-32" />
      </motion.div>

      {/* Stats grid skeleton */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Section title skeleton */}
      <motion.div variants={itemVariants}>
        <Skeleton className="h-5 w-32 mb-3" />
      </motion.div>

      {/* Cards skeleton */}
      <motion.div variants={itemVariants} className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
