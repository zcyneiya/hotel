import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type SkeletonProps = {
  children: React.ReactNode;
};

type SkeletonBlockProps = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
};

export const Skeleton: React.FC<SkeletonProps> = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  children,
  style,
  width,
  height,
  borderRadius,
}) => {
  const isContainer = Boolean(children);
  return (
    <View
      style={[
        styles.block,
        isContainer && styles.containerBlock,
        width != null && { width },
        height != null && { height },
        borderRadius != null && { borderRadius },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  block: {
    backgroundColor: '#EFEFEF',
    overflow: 'hidden',
  },
  containerBlock: {
    backgroundColor: 'transparent',
  },
});
