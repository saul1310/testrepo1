import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Canvas from 'react-native-canvas';

type Point = {
  x: number;
  y: number;
  color: string;
};

export default function DrawingPage() {
  const [points, setPoints] = useState<Point[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('black');
  const canvasRef = useRef<Canvas | null>(null);
  const currentColorRef = useRef(currentColor);

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

  const exportAsCorruptPNG = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 300;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Draw all points on the canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = point.color;
      ctx.fill();
    });

    // Get PNG base64
    const dataURL = await canvas.toDataURL('image/png');
    const base64 = dataURL.replace(/^data:image\/png;base64,/, '');

    // ❗ Intentionally corrupt PNG: remove a chunk of bytes
    const corruptBase64 = base64.slice(0, base64.length - 100) + 'GARBAGE==';

    // "Save" or log it — you would use react-native-fs or similar here
    console.log('Corrupt PNG base64:', corruptBase64.slice(0, 100) + '...');

    Alert.alert('Exported', 'Drawing exported as (corrupt) PNG.');
  };

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

      <Canvas
        ref={(canvas) => (canvasRef.current = canvas)}
        style={{ display: 'none' }} // hidden
      />

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
          style={styles.actionButton}
          onPress={exportAsCorruptPNG}
        >
          <Text style={styles.actionText}>Export</Text>
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
    flexWrap: 'wrap',
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
  actionButton: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
  },
});
