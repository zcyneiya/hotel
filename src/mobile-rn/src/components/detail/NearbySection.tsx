import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDistance, type NearbyPoi } from '../../utils/poi';

interface NearbySectionProps {
  attractions: NearbyPoi[];
  transport: NearbyPoi[];
  malls: NearbyPoi[];
  loading?: boolean;
  onRefresh?: () => void;
}

const NearbySection: React.FC<NearbySectionProps> = ({
  attractions,
  transport,
  malls,
  loading = false,
  onRefresh,
}) => {
  const [showAllAttractions, setShowAllAttractions] = useState(false);
  const [showAllTransport, setShowAllTransport] = useState(false);
  const [showAllMalls, setShowAllMalls] = useState(false);

  const hasAny = useMemo(
    () => attractions.length > 0 || transport.length > 0 || malls.length > 0,
    [attractions, transport, malls]
  );

  const renderList = (
    label: string,
    list: NearbyPoi[],
    showAll: boolean,
    onToggle: () => void
  ) => {
    if (list.length === 0) return null;
    const displayList = showAll ? list : list.slice(0, 5);

    return (
      <View style={styles.nearbyItem}>
        <Text style={styles.nearbyLabel}>{label}</Text>
        {displayList.map((item, idx) => (
          <Text key={`${item.name}-${idx}`} style={styles.nearbyText}>
            {item.name}
            {item.distance ? ` · ${formatDistance(item.distance)}` : ''}
          </Text>
        ))}
        {list.length > 5 && (
          <TouchableOpacity onPress={onToggle}>
            <Text style={styles.toggleText}>
              {showAll ? '收起' : '展开更多'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.refreshContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={loading || !onRefresh}
        >
          <Text style={styles.refreshText}>
            {loading ? '加载中...' : '更新周边信息'}
          </Text>
        </TouchableOpacity>
      </View>

      {hasAny && (
        <View style={styles.nearbySection}>
          {renderList('🎯 附近景点:', attractions, showAllAttractions, () =>
            setShowAllAttractions(!showAllAttractions)
          )}
          {renderList('🚇 交通:', transport, showAllTransport, () =>
            setShowAllTransport(!showAllTransport)
          )}
          {renderList('🛍️ 商场:', malls, showAllMalls, () =>
            setShowAllMalls(!showAllMalls)
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  refreshContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  refreshButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nearbySection: {
    marginTop: 8,
  },
  nearbyItem: {
    marginBottom: 8,
  },
  nearbyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nearbyText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  toggleText: {
    color: '#FF385C',
    marginTop: 4,
  },
});

export default NearbySection;
