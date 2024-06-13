import React from 'react';
import { View, Text, Modal, Pressable, FlatList, useColorScheme } from 'react-native';
import styles from '../styles';


const PolygonModal = ({ modalVisible, setModalVisible, polygons, polygonNames, setDrawing, calculateArea, handleDeletePolygon, handleSelectPolygon }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <>
      <View style={isDarkMode ? styles.modalContainerDark : styles.modalContainer}>

        <Pressable onPress={() => { setDrawing(true); }}>
          <Text
            className='text-white text-center mb-3 text-xl mt-3 rounded-xl  bg-black py-4 mx-3'
          >Create Area</Text>
        </Pressable>
        <FlatList
          data={polygons}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => handleSelectPolygon(index)} style={isDarkMode ? styles.listItemDark : styles.listItem}>
              <Text style={isDarkMode ? styles.listItemTextDark : styles.listItemText}>{polygonNames[index]} - {calculateArea(item)} SF</Text>
              <Pressable onPress={() => handleDeletePolygon(index)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </Pressable>
            </Pressable>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </>
  );
};

export default PolygonModal;
