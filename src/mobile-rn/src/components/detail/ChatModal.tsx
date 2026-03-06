import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { aiService, ChatMessage } from '../../services/aiService';

const typewriterEffect = (
  fullText: string,
  onUpdate: (text: string) => void,
  onDone: () => void,
) => {
  let i = 0;
  const interval = setInterval(() => {
    i += 2;
    onUpdate(fullText.slice(0, i));
    if (i >= fullText.length) {
      clearInterval(interval);
      onUpdate(fullText);
      onDone();
    }
  }, 20);
  return interval;
};

const { height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  hotelId: string;
  hotelName: string;
};

const QUICK_QUESTIONS = [
  '酒店周围有什么好玩的？',
  '酒店周围有什么好吃的？',
  '附近有什么公共交通设施吗？',
  '酒店有餐厅吗？',
];

const ChatModal = ({ visible, onClose, hotelId, hotelName }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const listRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (messages.length === 0) {
        setMessages([{ role: 'assistant', content: `你好！我是${hotelName}的智能客服，有什么可以帮您？` }]);
      }
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const scrollToBottom = (force = false) => {
    if (force || atBottom) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 40;
    setAtBottom(isNearBottom);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    scrollToBottom(true);

    try {
      const reply = await aiService.chat(hotelId, nextMessages);
      setLoading(false);

      const assistantIndex = nextMessages.length;
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      scrollToBottom(true);

      typewriterEffect(
        reply,
        (partial) => {
          setMessages(prev => {
            const updated = [...prev];
            updated[assistantIndex] = { role: 'assistant', content: partial };
            return updated;
          });
          scrollToBottom();
        },
        () => scrollToBottom(),
      );
    } catch {
      setLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，网络异常，请稍后再试。' }]);
      scrollToBottom(true);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setMessages([]);
      setInput('');
      onClose();
    });
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="box-none">
        {/* 点击遮罩关闭 */}
        <Pressable style={styles.overlayDismiss} onPress={handleClose} />

        {/* 弹窗主体 */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerDot} />
                <Text style={styles.headerTitle}>智能客服</Text>
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <View style={{ flex: 1 }}>
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(_, i) => String(i)}
                renderItem={renderItem}
                contentContainerStyle={styles.msgList}
                onContentSizeChange={() => scrollToBottom()}
                onScroll={handleScroll}
                scrollEventThrottle={100}
                showsVerticalScrollIndicator={false}
              />
              {!atBottom && (
                <TouchableOpacity
                  style={styles.scrollDownBtn}
                  onPress={() => scrollToBottom(true)}
                >
                  <Text style={styles.scrollDownText}>↓</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Loading indicator */}
            {loading && (
              <View style={styles.typingRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>AI</Text>
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color="#FF385C" />
                </View>
              </View>
            )}

            {/* Quick questions */}
            {messages.length <= 1 && !loading && (
              <View style={styles.quickRow}>
                {QUICK_QUESTIONS.map((q) => (
                  <TouchableOpacity key={q} style={styles.quickChip} onPress={() => sendMessage(q)}>
                    <Text style={styles.quickChipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Input bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="输入您的问题..."
                placeholderTextColor="#aaa"
                multiline
                maxLength={200}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage(input)}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                onPress={() => sendMessage(input)}
                disabled={!input.trim() || loading}
              >
                <Text style={styles.sendBtnText}>发送</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  overlayDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF385C',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  closeBtn: {
    fontSize: 16,
    color: '#999',
  },
  msgList: {
    padding: 16,
    paddingBottom: 8,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAI: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF385C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#FF385C',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  bubbleTextAI: {
    color: '#222',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  quickChip: {
    borderWidth: 1,
    borderColor: '#FF385C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickChipText: {
    fontSize: 13,
    color: '#FF385C',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
  },
  sendBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#ffb3c1',
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollDownBtn: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF385C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollDownText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 22,
  },
});

export default ChatModal;
