import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Room } from '../../types/hotel';

interface RoomListProps {
  rooms: Room[];
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  roomCount: number;
  onDatePress: () => void;
  onGuestCountChange: (count: number) => void;
  onRoomCountChange: (count: number) => void;
  onBook: (roomType: string, availableRooms: number) => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  checkInDate,
  checkOutDate,
  guestCount,
  roomCount,
  onDatePress,
  onGuestCountChange,
  onRoomCountChange,
  onBook,
}) => {
  const updateGuestCount = (delta: number) => {
    const nextCount = Math.min(10, Math.max(1, guestCount + delta));
    onGuestCountChange(nextCount);
  };

  const updateRoomCount = (delta: number) => {
    const nextCount = Math.min(5, Math.max(1, roomCount + delta));
    onRoomCountChange(nextCount);
  };

  // 格式化日期显示
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[1]}月${parts[2]}日`;
  };

  return (
    <View>
      {/* 选择日历、人数、间数 Banner */}
      <View style={styles.bookingBanner}>
        <Text style={styles.bannerTitle}>选择入住信息</Text>
        <View style={styles.bannerRow}>
          <TouchableOpacity
            style={styles.bannerItem}
            onPress={onDatePress}>
            <Text style={styles.bannerLabel}>日期</Text>
            <Text style={[styles.bannerValue, (checkInDate && checkOutDate) && styles.bannerValueSelected]}>
              {checkInDate && checkOutDate
                ? `${formatDateDisplay(checkInDate)} - ${formatDateDisplay(checkOutDate)}`
                : '选择日期'}
            </Text>
          </TouchableOpacity>
          <View style={styles.bannerItem}>
            <Text style={styles.bannerLabel}>人数</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, guestCount <= 1 && styles.stepperBtnDisabled]}
                disabled={guestCount <= 1}
                onPress={() => updateGuestCount(-1)}>
                <Text style={styles.stepperText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.bannerValue}>{guestCount}人</Text>
              <TouchableOpacity
                style={[styles.stepperBtn, guestCount >= 10 && styles.stepperBtnDisabled]}
                disabled={guestCount >= 10}
                onPress={() => updateGuestCount(1)}>
                <Text style={styles.stepperText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bannerItem}>
            <Text style={styles.bannerLabel}>间数</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, roomCount <= 1 && styles.stepperBtnDisabled]}
                disabled={roomCount <= 1}
                onPress={() => updateRoomCount(-1)}>
                <Text style={styles.stepperText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.bannerValue}>{roomCount}间</Text>
              <TouchableOpacity
                style={[styles.stepperBtn, roomCount >= 5 && styles.stepperBtnDisabled]}
                disabled={roomCount >= 5}
                onPress={() => updateRoomCount(1)}>
                <Text style={styles.stepperText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.dividerLine} />

      {/* 房型列表 - 从低到高排序 */}
      <View style={styles.roomsSection}>
        <Text style={styles.sectionTitle}>选择房型</Text>
        {rooms
          ?.sort((a, b) => a.price - b.price)
          .map((room, index) => (
            <View key={index} style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomType}>{room.type}</Text>
                {room.area && (
                  <Text style={styles.roomArea}>{room.area}㎡</Text>
                )}
              </View>

              <View style={styles.roomMeta}>
                <Text style={styles.roomCapacity}>可住{room.capacity}人</Text>
                <Text style={styles.roomDivider}>·</Text>
                <Text style={styles.roomCount}>剩余{room.availableRooms}间</Text>
              </View>

              {room.facilities && room.facilities.length > 0 && (
                <View style={styles.roomFacilities}>
                  {room.facilities.slice(0, 3).map((f, i) => (
                    <Text key={i} style={styles.roomFacility}>
                      • {f}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.roomFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>¥</Text>
                  <Text style={styles.roomPrice}>{room.price}</Text>
                  <Text style={styles.priceUnit}>/晚</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => onBook(room.type, room.availableRooms || room.totalRooms)}>
                  <Text style={styles.bookText}>预订</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bookingBanner: {
    padding: 20,
    backgroundColor: '#fff',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bannerItem: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  bannerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bannerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperText: {
    fontSize: 16,
    lineHeight: 18,
    color: '#333',
    fontWeight: '600',
  },
  bannerValueSelected: {
    color: '#333',
  },
  dividerLine: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  roomsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  roomCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  roomArea: {
    fontSize: 14,
    color: '#666',
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomCapacity: {
    fontSize: 13,
    color: '#666',
  },
  roomDivider: {
    marginHorizontal: 8,
    fontSize: 13,
    color: '#ccc',
  },
  roomCount: {
    fontSize: 13,
    color: '#666',
  },
  roomFacilities: {
    marginBottom: 12,
  },
  roomFacility: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 14,
    color: '#FF385C',
    fontWeight: 'bold',
  },
  roomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF385C',
    marginLeft: 2,
  },
  priceUnit: {
    fontSize: 14,
    color: '#FF385C',
    marginLeft: 4,
  },
  bookBtn: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
