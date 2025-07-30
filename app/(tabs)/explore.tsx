import { useEffect, useRef, useState, } from 'react';
import {
  Alert,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

type Point = {
  x: number;
  y: number;
  color: string;
};

export default function DrawingPage() {
  const [points, setPoints] = useState<Point[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('black');
  const currentColorRef = useRef(currentColor);

 
  const drawingRef = useRef<View>(null);

  useEffect(() => {
    currentColorRef.current = currentColor;
  }, [currentColor]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (
        e: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { locationX, locationY } = e.nativeEvent;
        const color = currentColorRef.current;
        setPoints((prevPoints) => [
          ...prevPoints,
          { x: locationX, y: locationY, color },
        ]);
      },
    })
  ).current;

  const colors = ['black', 'red', 'blue', 'green'];

  const exportToPNG = async () => {
    try {
      const uri = await captureRef(drawingRef.current, {
        format: 'png',
        quality: 1,
      });
      Alert.alert('Exported to', uri);
    } catch (error) {
      Alert.alert('Error exporting', (error as Error).message);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* ❗Bug: drawingRef is not attached here, so captureRef will fail */}
      <View style={styles.container} {...panResponder.panHandlers}>
        {points.map((point, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                left: point.x - 5,
                top: point.y - 5,
                backgroundColor: point.color,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.controls}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              currentColor === color && styles.activeColor,
            ]}
            onPress={() => setCurrentColor(color)}
          />
        ))}

        {/* Eraser */}
        <TouchableOpacity
          style={[styles.colorButton, styles.eraserButton]}
          onPress={() => setCurrentColor('white')}
        >
          <Text style={styles.eraserText}>E</Text>
        </TouchableOpacity>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.colorButton, { backgroundColor: '#000' }]}
          onPress={exportToPNG}
        >
          <Text style={{ color: 'white' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ... styles remain unchanged
