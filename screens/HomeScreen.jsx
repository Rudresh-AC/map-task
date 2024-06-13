import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Modal, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PolygonModal from '../components/PolygonModal';

const HomeScreen = ({ navigation, route }) => {
  const { polygons: routePolygons, polygonNames: routePolygonNames } = route.params || { polygons: [], polygonNames: [] };

  const [modalVisible, setModalVisible] = useState(false);
  const [polygons, setPolygons] = useState(routePolygons);
  const [polygonNames, setPolygonNames] = useState(routePolygonNames);

  useEffect(() => {
    if (route.params?.polygons && route.params?.polygonNames) {
      setPolygons(route.params.polygons);
      setPolygonNames(route.params.polygonNames);
    }
  }, [route.params?.polygons, route.params?.polygonNames]);

  const handleSelectPolygon = (index) => {
    navigation.navigate('Map', { polygons, polygonNames, selectedPolygonIndex: index });
    setModalVisible(true);
  };

  const handleDeletePolygon = (index) => {
    const newPolygons = polygons.filter((_, i) => i !== index);
    const newPolygonNames = polygonNames.filter((_, i) => i !== index);
    setPolygons(newPolygons);
    setPolygonNames(newPolygonNames);
  };

  const calculateArea = (polygon) => {
    // Your calculateArea function here
  };

  const handleCreatePolygon = () => {
    navigation.navigate('Map', { polygons, polygonNames, drawing: true });
  };

  return (
    <View
    //  style={styles.container}
    className='h-full'
    
    > 
      <FlatList
        data={polygonNames}
        renderItem={({ item, index }) => (
          <View>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => handleDeletePolygon(index)}>
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      /> 
      <PolygonModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        polygons={polygons}
        polygonNames={polygonNames}
        setDrawing={() => navigation.navigate('Map', { polygons, polygonNames, drawing: true })}
        calculateArea={calculateArea}
        handleDeletePolygon={handleDeletePolygon}
        handleSelectPolygon={handleSelectPolygon}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1,  },
  // createButton: { position: 'absolute', bottom: 30, padding: 10, backgroundColor: 'blue' },
  // icon: { position: 'absolute', top: 40, right: 10 },
});
