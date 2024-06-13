import React, { useState, useRef } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity, FlatList, TextInput, Pressable, Alert, useColorScheme } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as turf from '@turf/turf';
import { NamePolygonModal, PolygonModal } from '../components';
import styles from '../styles';

const MapScreen = ({ navigation, route }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { polygons: initialPolygons, polygonNames: initialPolygonNames, drawing: initialDrawing } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [drawing, setDrawing] = useState(initialDrawing || false);
  const [polygons, setPolygons] = useState(initialPolygons || []);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [polygonNames, setPolygonNames] = useState(initialPolygonNames || []);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const mapRef = useRef(null);

  const handleMapPress = (e) => {
    if (!drawing) return;
    setCurrentPolygon([...currentPolygon, e.nativeEvent.coordinate]);
  };



  const handleFinishPolygon = () => {
    if (currentPolygon.length < 3) {
      Alert.alert('Error', 'You must draw at least 3 points to create a polygon.');
      return;
    }
    setNameModalVisible(true);
  };

  const handleSavePolygon = () => {
    const newPolygons = [...polygons, currentPolygon];
    const newPolygonNames = [...polygonNames, currentName];
    setPolygons(newPolygons);
    setPolygonNames(newPolygonNames);
    setCurrentPolygon([]);
    setCurrentName('');
    setDrawing(false);
    setNameModalVisible(false);
    navigation.navigate('Home', { polygons: newPolygons, polygonNames: newPolygonNames });
 };

  const handleCancelDrawing = () => {
    setCurrentPolygon([]);
    setDrawing(false);
    navigation.navigate('Home', { polygons: newPolygons, polygonNames: newPolygonNames });
  };

  const handleCancelNaming = () => {
    setCurrentPolygon([]);
    setCurrentName('');
    setNameModalVisible(false);
    setDrawing(false);
  };

  const calculatePolygonCenter = (coordinates) => {
    const latitudes = coordinates.map(coord => coord.latitude);
    const longitudes = coordinates.map(coord => coord.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    return {
      latitude: isNaN(midLat) ? 0 : midLat,
      longitude: isNaN(midLng) ? 0 : midLng
    };
  };

  const calculateArea = (polygon) => {
    const coordinates = polygon.map(coord => [coord.longitude, coord.latitude]);
    coordinates.push(coordinates[0]);
    const turfPolygon = turf.polygon([coordinates]);
    const areaInSquareMeters = turf.area(turfPolygon);
    const areaInSquareFeet = areaInSquareMeters * 10.7639;
    return areaInSquareFeet.toFixed(2);
  };

  const handleSelectPolygon = (index) => {
    const polygon = polygons[index];
    if (mapRef.current) {
      const coordinates = polygon;
      const latitudes = coordinates.map(coord => coord.latitude);
      const longitudes = coordinates.map(coord => coord.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latitudeDelta = maxLat - minLat + 0.01;
      const longitudeDelta = maxLng - minLng + 0.01;

      mapRef.current.animateToRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta,
        longitudeDelta,
      });
    }
    setSelectedPolygon(index);
    setModalVisible(false);
  };

  const handleDeletePolygon = (index) => {
    const newPolygons = polygons.filter((_, i) => i !== index);
    const newPolygonNames = polygonNames.filter((_, i) => i !== index);
    setPolygons(newPolygons);
    setPolygonNames(newPolygonNames);
    setSelectedPolygon(null);
  };


  return (
    <View style={isDarkMode ? styles.containerDark : styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        {polygons.map((polygon, index) => (
          <React.Fragment key={index}>
            <Polygon
              coordinates={polygon}
              strokeColor={selectedPolygon === index ? "#FFD700" : "#F00"}
              fillColor={selectedPolygon === index ? "rgba(255,215,0,0.5)" : "rgba(255,0,0,0.5)"}
            />
            <Marker coordinate={calculatePolygonCenter(polygon)}>
              <View style={styles.marker}>
                <Text style={styles.text}>{polygonNames[index]}</Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}
        {currentPolygon.length > 0 && (
          <Polygon coordinates={currentPolygon} strokeColor="#00F" fillColor="rgba(0,0,255,0.3)" />
        )}
      </MapView>

      {drawing && (
        <View style={styles.drawingButtons}>
          <TouchableOpacity onPress={handleCancelDrawing}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFinishPolygon}>
            <Text style={styles.finishBtn}>Finished</Text>
          </TouchableOpacity>
        </View>
      )}
      <NamePolygonModal
        nameModalVisible={nameModalVisible}
        setNameModalVisible={setNameModalVisible}
        currentName={currentName}
        setCurrentName={setCurrentName}
        handleSavePolygon={handleSavePolygon}
        handleCancelNaming={handleCancelNaming}
      />
    </View>
  );
};

export default MapScreen;