import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');

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

  // 动画值
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 进场动画
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 离场动画
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    // 先执行离场动画，再调用 onClose
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleConfirm = () => {
    if (selectedCheckIn && selectedCheckOut) {
      onConfirm(selectedCheckIn, selectedCheckOut);
      handleClose();
    }
  };
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
  // handleConfirm 已在上方重写，这里删除多余部分

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

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none" // 关闭默认动画，使用自定义动画
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContent, 
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              {/* 头部 */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.headerAction}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.title}>选择日期</Text>
                <TouchableOpacity onPress={handleReset} style={styles.headerActionRight}>
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
              <Text style={styles.monthBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {year}年 {monthNames[month]}
            </Text>
            <TouchableOpacity
              onPress={() => changeMonth(1)}
              style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>›</Text>
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
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  </TouchableWithoutFeedback>
</Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 'auto',
    maxHeight: '80%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: '#FFFFFF',
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  headerActionRight: {
    minWidth: 54,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  closeBtn: {
    fontSize: 18,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  resetBtn: {
    fontSize: 13,
    color: '#FF385C',
    fontWeight: '600',
  },
  selectedDates: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    padding: 13,
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateLabel: {
    fontSize: 11,
    color: '#9A9A9A',
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202020',
  },
  dateDivider: {
    fontSize: 14,
    color: '#BDBDBD',
    marginHorizontal: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 6,
  },
  monthBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  monthBtnText: {
    fontSize: 20,
    color: '#2F2F2F',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  weekDay: {
    width: (width - 32) / 7,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: '600',
  },
  calendarScroll: {
    maxHeight: 340,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  dayCell: {
    width: (width - 32) / 7,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
  checkInCell: {
    backgroundColor: '#FF385C',
    borderRadius: 24,
  },
  checkOutCell: {
    backgroundColor: '#FF385C',
    borderRadius: 24,
  },
  inRangeCell: {
    backgroundColor: '#FFE8EE',
    borderRadius: 10,
  },
  pastCell: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 15,
    color: '#2B2B2B',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  pastDayText: {
    color: '#C7C7C7',
  },
  dayLabel: {
    fontSize: 10,
    color: '#FFF4F7',
    marginTop: 1,
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  confirmBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#F5A3B3',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DateRangePicker;
