import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  useColorScheme,
} from 'react-native';
import MapView, {Polygon, Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as turf from '@turf/turf';

const AreaList = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [polygonNames, setPolygonNames] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const mapRef = useRef(null);

  const handleMapPress = e => {
    if (!drawing) return;
    setCurrentPolygon([...currentPolygon, e.nativeEvent.coordinate]);
  };

  const handleFinishPolygon = () => {
    if (currentPolygon.length < 3) {
      Alert.alert(
        'Error',
        'You must draw at least 3 points to create a polygon.',
      );
      return;
    }
    setNameModalVisible(true);
  };

  const handleSavePolygon = () => {
    setPolygons([...polygons, currentPolygon]);
    setPolygonNames([...polygonNames, currentName]);
    setCurrentPolygon([]);
    setCurrentName('');
    setDrawing(false);
    setNameModalVisible(false);
  };

  const handleDeletePolygon = index => {
    const newPolygons = polygons.filter((_, i) => i !== index);
    const newPolygonNames = polygonNames.filter((_, i) => i !== index);
    setPolygons(newPolygons);
    setPolygonNames(newPolygonNames);
    setSelectedPolygon(null);
  };

  const handleSelectPolygon = index => {
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

  const handleCancelDrawing = () => {
    setCurrentPolygon([]);
    setDrawing(false);
  };

  const handleCancelNaming = () => {
    setCurrentPolygon([]);
    setCurrentName('');
    setNameModalVisible(false);
    setDrawing(false);
  };

  const calculatePolygonCenter = coordinates => {
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
      longitude: isNaN(midLng) ? 0 : midLng,
    };
  };

  const calculateArea = polygon => {
    const coordinates = polygon.map(coord => [coord.longitude, coord.latitude]);
    coordinates.push(coordinates[0]); // Close the polygon by adding the first coordinate at the end
    const turfPolygon = turf.polygon([coordinates]);
    const areaInSquareMeters = turf.area(turfPolygon);
    const areaInSquareFeet = areaInSquareMeters * 10.7639; // Convert square meters to square feet
    return areaInSquareFeet.toFixed(2); // Return the area rounded to 2 decimal places
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
        }}>
        {polygons.map((polygon, index) => (
          <React.Fragment key={index}>
            <Polygon
              coordinates={polygon}
              strokeColor={selectedPolygon === index ? '#FFD700' : '#F00'}
              fillColor={
                selectedPolygon === index
                  ? 'rgba(255,215,0,0.5)'
                  : 'rgba(255,0,0,0.5)'
              }
            />
            <Marker
              coordinate={calculatePolygonCenter(polygon)}
              title={polygonNames[index]}
            />
          </React.Fragment>
        ))}
        {currentPolygon.length > 0 && (
          <Polygon
            coordinates={currentPolygon}
            strokeColor="#00F"
            fillColor="rgba(0,0,255,0.3)"
          />
        )}
      </MapView>
      <TouchableOpacity
        style={isDarkMode ? styles.iconDark : styles.icon}
        onPress={() => setModalVisible(true)}>
        <Icon name="list" size={30} color={isDarkMode ? 'white' : 'black'} />
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View
          style={
            isDarkMode ? styles.modalContainerDark : styles.modalContainer
          }>
          <Text style={styles.modalTitle}>Shapes</Text>
          <Pressable
            onPress={() => {
              setDrawing(true);
              setModalVisible(false);
            }}>
            <Text style={styles.buttonText}>Create Area</Text>
          </Pressable>
          <FlatList
            data={polygons}
            renderItem={({item, index}) => (
              <Pressable
                onPress={() => handleSelectPolygon(index)}
                style={isDarkMode ? styles.listItemDark : styles.listItem}>
                <Text
                  style={
                    isDarkMode ? styles.listItemTextDark : styles.listItemText
                  }>
                  {polygonNames[index]} - {calculateArea(item)} SF
                </Text>
                <Pressable onPress={() => handleDeletePolygon(index)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </Pressable>
              </Pressable>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <Pressable onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
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
      <Modal
        visible={nameModalVisible}
        transparent={true}
        animationType="slide">
        <View
          style={
            isDarkMode
              ? styles.nameModalContainerDark
              : styles.nameModalContainer
          }>
          <Text style={styles.modalTitle}>Name Your Area</Text>
          <TextInput
            style={isDarkMode ? styles.textInputDark : styles.textInput}
            placeholder="Enter Area Name"
            placeholderTextColor={isDarkMode ? '#CCC' : '#666'}
            value={currentName}
            onChangeText={setCurrentName}
          />
          <View style={styles.namingButtons}>
            <Pressable onPress={handleCancelNaming}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSavePolygon}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  containerDark: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
  },
  iconDark: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainerDark: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    flexWrap: 'wrap',
  },
  listItemDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    marginVertical: 5,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    flexWrap: 'wrap',
  },
  listItemText: {
    fontSize: 16,
  },
  listItemTextDark: {
    fontSize: 16,
    color: 'white',
  },
  drawingButtons: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
  },
  finishButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#375B81B7',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginVertical: 5,
  },
  finishBtn: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#BE2F2A',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginVertical: 5,
  },
  nameModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  nameModalContainerDark: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  textInput: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '80%',
    borderRadius: 7,
  },
  textInputDark: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#333',
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '80%',
    borderRadius: 7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginVertical: 5,
  },
  deleteButton: {
    color: 'white',
    fontSize: 16,
    backgroundColor: '#FF0000',
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
    marginTop: 5,
  },
  namingButtons: {
    flexDirection: 'row',
  },
});

export default AreaList;
