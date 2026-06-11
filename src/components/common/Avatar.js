import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {fontWeight} from '../../theme';

const COLORS = ['#3D2ECC', '#E6A817', '#27AE60', '#EB5757', '#F2994A', '#9B59B6'];

const getColor = name => COLORS[name.charCodeAt(0) % COLORS.length];

const Avatar = ({name = '?', size = 40, style}) => (
  <View
    style={[
      styles.avatar,
      {width: size, height: size, borderRadius: size / 2, backgroundColor: getColor(name)},
      style,
    ]}>
    <Text style={[styles.text, {fontSize: size * 0.38}]}>
      {name[0].toUpperCase()}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
});

export default Avatar;
