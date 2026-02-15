import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (checkIn: string, checkOut: string) => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialCheckIn,
  initialCheckOut,
}) => {
  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(
    initialCheckIn || null
  );
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(
    initialCheckOut || null
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 生成日历数据
  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // 填充月初空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (year: number, month: number, day: number): string => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // 解析日期字符串
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  // 判断日期是否在范围内
  const isInRange = (dateStr: string): boolean => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const date = parseDate(dateStr);
    const checkIn = parseDate(selectedCheckIn);
    const checkOut = parseDate(selectedCheckOut);
    if (!date || !checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  };

  // 判断日期是否已过期
  const isPastDate = (year: number, month: number, day: number): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(year, month, day);
    return date < today;
  };

  // 处理日期点击
  const handleDatePress = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = formatDate(year, month, day);

    // 不允许选择过去的日期
    if (isPastDate(year, month, day)) {
      return;
    }

    if (!selectedCheckIn) {
      // 选择入住日期
      setSelectedCheckIn(dateStr);
      setSelectedCheckOut(null);
    } else if (!selectedCheckOut) {
      // 选择离店日期
      const checkInDate = parseDate(selectedCheckIn);
      const checkOutDate = parseDate(dateStr);
      
      if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
        setSelectedCheckOut(dateStr);
      } else {
        // 如果选择的日期早于入住日期，重新选择入住日期
        setSelectedCheckIn(dateStr);
        setSelectedCheckOut(null);
      }
    } else {
      // 重新选择
      setSelectedCheckIn(dateStr);
      setSelectedCheckOut(null);
    }
  };

  // 切换月份
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedCheckIn && selectedCheckOut) {
      onConfirm(selectedCheckIn, selectedCheckOut);
      onClose();
    }
  };

  // 重置选择
  const handleReset = () => {
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const days = generateCalendar(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>选择日期</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetBtn}>重置</Text>
            </TouchableOpacity>
          </View>

          {/* 选中日期显示 */}
          <View style={styles.selectedDates}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>入住</Text>
              <Text style={styles.dateValue}>
                {selectedCheckIn || '选择日期'}
              </Text>
            </View>
            <Text style={styles.dateDivider}>→</Text>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>离店</Text>
              <Text style={styles.dateValue}>
                {selectedCheckOut || '选择日期'}
              </Text>
            </View>
          </View>

          {/* 月份切换 */}
          <View style={styles.monthSelector}>
            <TouchableOpacity
              onPress={() => changeMonth(-1)}
              style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {year}年 {monthNames[month]}
            </Text>
            <TouchableOpacity
              onPress={() => changeMonth(1)}
              style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>→</Text>
            </TouchableOpacity>
          </View>

          {/* 星期标题 */}
          <View style={styles.weekRow}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDay}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* 日历 */}
          <ScrollView style={styles.calendarScroll}>
            <View style={styles.calendar}>
              {days.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const dateStr = formatDate(year, month, day);
                const isCheckIn = dateStr === selectedCheckIn;
                const isCheckOut = dateStr === selectedCheckOut;
                const inRange = isInRange(dateStr);
                const isPast = isPastDate(year, month, day);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      isCheckIn && styles.checkInCell,
                      isCheckOut && styles.checkOutCell,
                      inRange && styles.inRangeCell,
                      isPast && styles.pastCell,
                    ]}
                    onPress={() => handleDatePress(day)}
                    disabled={isPast}>
                    <Text
                      style={[
                        styles.dayText,
                        (isCheckIn || isCheckOut) && styles.selectedDayText,
                        isPast && styles.pastDayText,
                      ]}>
                      {day}
                    </Text>
                    {isCheckIn && (
                      <Text style={styles.dayLabel}>入住</Text>
                    )}
                    {isCheckOut && (
                      <Text style={styles.dayLabel}>离店</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (!selectedCheckIn || !selectedCheckOut) && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedCheckIn || !selectedCheckOut}>
              <Text style={styles.confirmBtnText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeBtn: {
    fontSize: 24,
    color: '#666',
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resetBtn: {
    fontSize: 14,
    color: '#FF385C',
    width: 40,
    textAlign: 'right',
  },
  selectedDates: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateDivider: {
    fontSize: 18,
    color: '#666',
    marginHorizontal: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  monthBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthBtnText: {
    fontSize: 20,
    color: '#333',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  weekDay: {
    width: (width - 32) / 7,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  calendarScroll: {
    maxHeight: 350,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayCell: {
    width: (width - 32) / 7,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkInCell: {
    backgroundColor: '#FF385C',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  checkOutCell: {
    backgroundColor: '#FF385C',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  inRangeCell: {
    backgroundColor: '#FFE5E5',
  },
  pastCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pastDayText: {
    color: '#ccc',
  },
  dayLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#ccc',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DateRangePicker;
