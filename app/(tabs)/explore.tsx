import React, { useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Point = {
  x: number;
  y: number;
  color: string;
};

export default function DrawingPage() {
  const [points, setPoints] = useState<Point[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('black');
  const currentColorRef = useRef(currentColor);

  useEffect(() => {
    currentColorRef.current = currentColor;
  }, [currentColor]);

  useEffect(() => {
    setPoints([]);
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

  return (
    <View style={styles.wrapper}>
      {/* Drawing Area */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  controls: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-around',
    backgroundColor: '#eee',
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  activeColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
  eraserButton: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraserText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
