import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {borderRadius, spacing} from '../../theme';

// ─── Base shimmer block ────────────────────────────────────────────────────────

export const SkeletonText = ({width = '100%', height = 14, style}) => {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {toValue: 1, duration: 750, useNativeDriver: true}),
        Animated.timing(anim, {toValue: 0.4, duration: 750, useNativeDriver: true}),
      ]),
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.block,
        {width, height, opacity: anim},
        style,
      ]}
    />
  );
};

// ─── Card-shaped skeleton ─────────────────────────────────────────────────────

export const SkeletonCard = () => (
  <View style={styles.card}>
    <SkeletonText width="40%" height={12} style={{marginBottom: 10}} />
    <SkeletonText width="70%" height={20} style={{marginBottom: 12}} />
    <SkeletonText width="60%" height={12} style={{marginBottom: 16}} />
    <View style={styles.cardFooter}>
      <SkeletonText width="35%" height={22} />
      <SkeletonText width="20%" height={18} />
    </View>
  </View>
);

// ─── Transaction row skeleton ─────────────────────────────────────────────────

export const SkeletonRow = () => (
  <View style={styles.row}>
    <SkeletonText width={44} height={44} style={{borderRadius: borderRadius.md}} />
    <View style={styles.rowInfo}>
      <SkeletonText width="55%" height={13} style={{marginBottom: 6}} />
      <SkeletonText width="35%" height={11} />
    </View>
    <SkeletonText width={60} height={14} />
  </View>
);

// ─── List of skeletons ────────────────────────────────────────────────────────

export const SkeletonList = ({count = 5, renderItem}) => (
  <>
    {Array.from({length: count}).map((_, i) =>
      renderItem ? renderItem(i) : <SkeletonRow key={i} />,
    )}
  </>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#E0E0E0',
    borderRadius: borderRadius.sm,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowInfo: {
    flex: 1,
  },
});