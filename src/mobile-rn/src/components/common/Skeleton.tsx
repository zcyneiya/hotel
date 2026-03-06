import React from 'react';
import { StyleSheet, View, ViewStyle, DimensionValue } from 'react-native';

type SkeletonProps = {
  children: React.ReactNode;
};

type SkeletonBlockProps = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
};

//骨架瓶容器
export const Skeleton: React.FC<SkeletonProps> = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

//骨架瓶块
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
